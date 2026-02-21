const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let apiServer = null;
let apiPort = null;
let startupLogPath = "";
let quitting = false;
let shutdownPromise = null;
let appOrigin = "";
let lastRestoreResult = null;
let autoUpdateEnabled = false;
let updateReadyToInstall = false;

const DB_FILE_NAME = process.env.TIMETRACK_DB_FILE || "timetrack.db";

function fileStamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}-${hh}${mm}${ss}`;
}

function getDbPath(runtimePaths) {
  return path.join(runtimePaths.dataDir, DB_FILE_NAME);
}

function getRestorePaths(runtimePaths) {
  const restoreDir = path.join(runtimePaths.userDataDir, "restore");
  return {
    restoreDir,
    pendingPath: path.join(restoreDir, "pending-restore.json"),
    stagedBackupPath: path.join(restoreDir, "staged-restore.db"),
    resultPath: path.join(restoreDir, "last-restore-result.json"),
  };
}

function appendStartupLog(message) {
  if (!startupLogPath) return;
  try {
    fs.mkdirSync(path.dirname(startupLogPath), { recursive: true });
    fs.appendFileSync(startupLogPath, `${new Date().toISOString()} ${message}\n`);
  } catch (error) {
    console.error("[TimeTrack/Electron] failed to write startup log", error);
  }
}

function sendUpdateStatus(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("desktop:update-status", payload);
}

function canUseAutoUpdate() {
  if (!app.isPackaged) return false;
  if (process.env.TIMETRACK_DISABLE_AUTO_UPDATE === "1") return false;
  if (process.platform === "linux") return false;
  return true;
}

function configureAutoUpdater() {
  autoUpdateEnabled = canUseAutoUpdate();
  if (!autoUpdateEnabled) {
    appendStartupLog("[UPDATE] auto update disabled (non-packaged or unsupported environment)");
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    appendStartupLog("[UPDATE] checking for updates");
    sendUpdateStatus({ stage: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    appendStartupLog(`[UPDATE] update available: ${info?.version || "unknown"}`);
    sendUpdateStatus({ stage: "available", version: info?.version || "" });
  });

  autoUpdater.on("update-not-available", (info) => {
    appendStartupLog(`[UPDATE] no update available (current=${app.getVersion()}, latest=${info?.version || "n/a"})`);
    sendUpdateStatus({ stage: "not-available", version: info?.version || app.getVersion() });
  });

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus({
      stage: "downloading",
      percent: Number(progress?.percent || 0),
      bytesPerSecond: Number(progress?.bytesPerSecond || 0),
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    updateReadyToInstall = true;
    appendStartupLog(`[UPDATE] update downloaded: ${info?.version || "unknown"}`);
    sendUpdateStatus({ stage: "downloaded", version: info?.version || "" });
  });

  autoUpdater.on("error", (error) => {
    appendStartupLog(`[UPDATE] error: ${error?.message || "unknown"}`);
    sendUpdateStatus({ stage: "error", message: error?.message || "업데이트 확인 중 오류가 발생했습니다." });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => {
      appendStartupLog(`[UPDATE] initial check failed: ${error.message}`);
    });
  }, 5000);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveRuntimePaths() {
  const userDataDir = app.getPath("userData");
  const dataDir = process.env.TIMETRACK_DATA_DIR
    ? path.resolve(process.env.TIMETRACK_DATA_DIR)
    : path.join(userDataDir, "data");
  const staticDir = path.join(__dirname, "..", "public");

  return {
    userDataDir,
    dataDir,
    staticDir,
    startupLogPath: path.join(userDataDir, "startup.log"),
  };
}

function loadLastRestoreResult(runtimePaths) {
  const { resultPath } = getRestorePaths(runtimePaths);
  try {
    if (!fs.existsSync(resultPath)) {
      lastRestoreResult = null;
      return;
    }
    const parsed = JSON.parse(fs.readFileSync(resultPath, "utf8"));
    if (parsed && typeof parsed === "object") {
      lastRestoreResult = parsed;
    }
  } catch (error) {
    appendStartupLog(`[RESTORE] failed to load last restore result: ${error.message}`);
    lastRestoreResult = {
      ok: false,
      message: "이전 복원 결과를 읽지 못했습니다.",
      timestamp: new Date().toISOString(),
    };
  }
}

function saveLastRestoreResult(runtimePaths, payload) {
  const { restoreDir, resultPath } = getRestorePaths(runtimePaths);
  fs.mkdirSync(restoreDir, { recursive: true });
  fs.writeFileSync(resultPath, JSON.stringify(payload, null, 2), "utf8");
  lastRestoreResult = payload;
}

function validateBackupFile(backupPath) {
  let sourceDb = null;
  try {
    sourceDb = new Database(backupPath, { readonly: true, fileMustExist: true });
    const quickCheck = sourceDb.pragma("quick_check", { simple: true });
    if (quickCheck !== "ok") {
      throw new Error(`integrity check failed: ${quickCheck}`);
    }

    const requiredTables = ["students", "lessons", "pin_audit"];
    const existingTables = sourceDb
      .prepare(
        `SELECT name
         FROM sqlite_master
         WHERE type='table' AND name IN ('students', 'lessons', 'pin_audit')`
      )
      .all()
      .map((row) => row.name);

    for (const tableName of requiredTables) {
      if (!existingTables.includes(tableName)) {
        throw new Error(`required table missing: ${tableName}`);
      }
    }
  } finally {
    if (sourceDb) sourceDb.close();
  }
}

async function createBackupAt(runtimePaths, destinationPath) {
  const dbPath = getDbPath(runtimePaths);
  let sourceDb = null;
  try {
    sourceDb = new Database(dbPath, { fileMustExist: true });
    sourceDb.pragma("busy_timeout = 5000");
    sourceDb.pragma("wal_checkpoint(TRUNCATE)");
    await sourceDb.backup(destinationPath);
    validateBackupFile(destinationPath);
  } finally {
    if (sourceDb) sourceDb.close();
  }
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_error) {
    // Intentionally ignored for cleanup paths.
  }
}

function applyPendingRestore(runtimePaths) {
  const restorePaths = getRestorePaths(runtimePaths);
  const dbPath = getDbPath(runtimePaths);
  if (!fs.existsSync(restorePaths.pendingPath)) return;

  appendStartupLog("[RESTORE] pending restore detected");
  fs.mkdirSync(restorePaths.restoreDir, { recursive: true });

  let rollbackPath = "";
  let stagedPath = restorePaths.stagedBackupPath;

  try {
    const pending = JSON.parse(fs.readFileSync(restorePaths.pendingPath, "utf8"));
    if (pending?.stagedBackupPath) stagedPath = pending.stagedBackupPath;
    if (!stagedPath || !fs.existsSync(stagedPath)) {
      throw new Error("staged restore file not found");
    }

    validateBackupFile(stagedPath);

    if (fs.existsSync(dbPath)) {
      rollbackPath = path.join(runtimePaths.dataDir, `${path.basename(dbPath)}.pre-restore-${fileStamp()}`);
      fs.copyFileSync(dbPath, rollbackPath);
    }

    const tempRestorePath = `${dbPath}.restoring`;
    fs.copyFileSync(stagedPath, tempRestorePath);
    fs.renameSync(tempRestorePath, dbPath);
    safeUnlink(`${dbPath}-wal`);
    safeUnlink(`${dbPath}-shm`);

    validateBackupFile(dbPath);
    safeUnlink(restorePaths.pendingPath);
    safeUnlink(stagedPath);

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      message: "백업 복원이 완료되었습니다.",
      restoredFrom: path.basename(stagedPath),
    };
    saveLastRestoreResult(runtimePaths, result);
    appendStartupLog("[RESTORE] restore applied successfully");
  } catch (error) {
    appendStartupLog(`[RESTORE] restore failed: ${error.message}`);
    try {
      if (rollbackPath && fs.existsSync(rollbackPath)) {
        fs.copyFileSync(rollbackPath, dbPath);
        safeUnlink(`${dbPath}-wal`);
        safeUnlink(`${dbPath}-shm`);
      }
    } catch (rollbackError) {
      appendStartupLog(`[RESTORE] rollback failed: ${rollbackError.message}`);
    }

    const result = {
      ok: false,
      timestamp: new Date().toISOString(),
      message: `복원 실패: ${error.message}`,
    };
    saveLastRestoreResult(runtimePaths, result);
    safeUnlink(restorePaths.pendingPath);
  }
}

function ensureWritableDataDir(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const probeFile = path.join(dataDir, ".timetrack-write-check");
  fs.writeFileSync(probeFile, String(Date.now()));
  fs.rmSync(probeFile);
}

async function startEmbeddedServer(runtimePaths) {
  process.env.TIMETRACK_DATA_DIR = runtimePaths.dataDir;

  const { startServer } = require(path.join(__dirname, "..", "src", "server"));
  return startServer({
    port: 0,
    host: "127.0.0.1",
    staticDir: runtimePaths.staticDir,
    logPrefix: "TimeTrack/Electron",
  });
}

function createMainWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1460,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#f6f7fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const targetUrl = `http://127.0.0.1:${port}`;
  appOrigin = new URL(targetUrl).origin;
  mainWindow.loadURL(targetUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    appendStartupLog(`[WINDOW_OPEN_DENY] ${url}`);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    let nextOrigin = "";
    try {
      nextOrigin = new URL(navigationUrl).origin;
    } catch (_error) {
      event.preventDefault();
      appendStartupLog(`[NAVIGATION_BLOCKED] invalid URL: ${navigationUrl}`);
      return;
    }
    if (nextOrigin !== appOrigin) {
      event.preventDefault();
      appendStartupLog(`[NAVIGATION_BLOCKED] ${navigationUrl}`);
    }
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedUrl) => {
    appendStartupLog(
      `[LOAD_FAIL] code=${errorCode} reason=${errorDescription} url=${validatedUrl || targetUrl}`
    );
  });

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    appendStartupLog(`[RENDER_GONE] reason=${details.reason} code=${details.exitCode}`);
  });

  mainWindow.on("unresponsive", () => {
    appendStartupLog("[WINDOW] renderer became unresponsive");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function focusMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
}

function stopEmbeddedServer() {
  if (!apiServer) return Promise.resolve();
  if (shutdownPromise) return shutdownPromise;

  shutdownPromise = new Promise((resolve) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      appendStartupLog("[SHUTDOWN] server close timeout reached");
      resolve();
    }, 5000);

    apiServer.close((error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (error) {
        appendStartupLog(`[SHUTDOWN] server close error: ${error.message}`);
      } else {
        appendStartupLog("[SHUTDOWN] embedded server closed cleanly");
      }
      resolve();
    });
  }).finally(() => {
    apiServer = null;
    shutdownPromise = null;
  });

  return shutdownPromise;
}

async function bootstrap() {
  const runtimePaths = resolveRuntimePaths();
  startupLogPath = runtimePaths.startupLogPath;

  appendStartupLog(`[BOOT] userData=${runtimePaths.userDataDir}`);
  appendStartupLog(`[BOOT] staticDir=${runtimePaths.staticDir}`);

  ensureWritableDataDir(runtimePaths.dataDir);
  appendStartupLog(`[BOOT] dataDir writable: ${runtimePaths.dataDir}`);
  applyPendingRestore(runtimePaths);
  loadLastRestoreResult(runtimePaths);

  const started = await startEmbeddedServer(runtimePaths);
  apiServer = started.server;
  apiPort = started.port;

  appendStartupLog(`[BOOT] embedded server port=${started.port}`);
  appendStartupLog(`[BOOT] dbPath=${started.dbPath}`);

  createMainWindow(started.port);
  configureAutoUpdater();
}

function createStartupFailureWindow(error) {
  const runtimePaths = resolveRuntimePaths();
  const dbPath = getDbPath(runtimePaths);
  const details = error?.message || "Unknown startup failure";
  const steps = Array.isArray(error?.recoverySteps) && error.recoverySteps.length
    ? error.recoverySteps
    : [
        `DB 파일을 안전한 위치에 보관하세요: ${dbPath}`,
        "정상 백업 파일이 있다면 이후 앱 실행 후 복원 기능을 사용하세요.",
        "문제가 계속되면 startup.log와 DB 파일 사본으로 점검하세요.",
      ];

  mainWindow = new BrowserWindow({
    width: 860,
    height: 640,
    minWidth: 760,
    minHeight: 560,
    backgroundColor: "#f8fafc",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const pageHtml = `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TimeTrack Recovery Guidance</title>
        <style>
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f3f6fb; color: #1f2a3f; }
          .wrap { max-width: 820px; margin: 0 auto; padding: 28px; }
          .card { background: #fff; border: 1px solid #dce4ef; border-radius: 14px; padding: 22px; box-shadow: 0 10px 24px rgba(31, 43, 64, 0.08); }
          h1 { margin: 0 0 12px; font-size: 1.5rem; }
          p { margin: 0 0 10px; color: #46556f; line-height: 1.5; }
          ol { margin: 12px 0 0; padding-left: 22px; color: #2f3e56; line-height: 1.6; }
          code { background: #f4f7fc; border: 1px solid #dde5f0; border-radius: 6px; padding: 1px 6px; }
          .meta { margin-top: 14px; font-size: 0.9rem; color: #5f6f88; }
          .fail { margin-top: 10px; padding: 12px; border-radius: 10px; background: #fff3f2; border: 1px solid #ffd7d2; color: #8e3129; }
        </style>
      </head>
      <body>
        <main class="wrap">
          <section class="card">
            <h1>데이터베이스 점검 실패</h1>
            <p>앱 시작 중 스키마/무결성 검증을 통과하지 못했습니다. 아래 순서로 복구를 진행하세요.</p>
            <div class="fail">${escapeHtml(details)}</div>
            <ol>
              ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
            </ol>
            <p class="meta">DB 경로: <code>${escapeHtml(dbPath)}</code></p>
            <p class="meta">로그 경로: <code>${escapeHtml(runtimePaths.startupLogPath)}</code></p>
          </section>
        </main>
      </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(pageHtml)}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerDesktopIpc() {
  ipcMain.handle("desktop:create-backup", async () => {
    const runtimePaths = resolveRuntimePaths();
    const dbPath = getDbPath(runtimePaths);
    const defaultFileName = `timetrack-backup-${fileStamp()}.db`;
    const dialogResult = await dialog.showSaveDialog(mainWindow || undefined, {
      title: "TimeTrack 백업 저장",
      defaultPath: path.join(app.getPath("documents"), defaultFileName),
      buttonLabel: "백업 저장",
      filters: [
        { name: "SQLite DB", extensions: ["db", "sqlite", "sqlite3"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (dialogResult.canceled || !dialogResult.filePath) {
      return { ok: false, canceled: true, message: "백업이 취소되었습니다." };
    }

    try {
      if (!fs.existsSync(dbPath)) {
        throw new Error("데이터베이스 파일을 찾지 못했습니다.");
      }
      await createBackupAt(runtimePaths, dialogResult.filePath);
      return {
        ok: true,
        path: dialogResult.filePath,
        message: "백업 파일이 생성되었습니다.",
      };
    } catch (error) {
      appendStartupLog(`[BACKUP] failed: ${error.message}`);
      return {
        ok: false,
        message: `백업 실패: ${error.message}`,
      };
    }
  });

  ipcMain.handle("desktop:restore-backup", async () => {
    const runtimePaths = resolveRuntimePaths();
    const restorePaths = getRestorePaths(runtimePaths);
    const dialogResult = await dialog.showOpenDialog(mainWindow || undefined, {
      title: "복원할 백업 파일 선택",
      buttonLabel: "복원 준비",
      properties: ["openFile"],
      filters: [
        { name: "SQLite DB", extensions: ["db", "sqlite", "sqlite3"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (dialogResult.canceled || !dialogResult.filePaths.length) {
      return { ok: false, canceled: true, message: "복원이 취소되었습니다." };
    }

    const sourcePath = dialogResult.filePaths[0];
    try {
      validateBackupFile(sourcePath);
      fs.mkdirSync(restorePaths.restoreDir, { recursive: true });
      fs.copyFileSync(sourcePath, restorePaths.stagedBackupPath);
      fs.writeFileSync(
        restorePaths.pendingPath,
        JSON.stringify(
          {
            requestedAt: new Date().toISOString(),
            sourcePath,
            stagedBackupPath: restorePaths.stagedBackupPath,
          },
          null,
          2
        ),
        "utf8"
      );

      saveLastRestoreResult(runtimePaths, {
        ok: true,
        pending: true,
        timestamp: new Date().toISOString(),
        message: "복원 준비가 완료되었습니다. 앱을 다시 시작해 적용합니다.",
      });

      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 150);

      return {
        ok: true,
        relaunching: true,
        message: "복원 준비 완료. 앱을 재시작합니다.",
      };
    } catch (error) {
      appendStartupLog(`[RESTORE] staging failed: ${error.message}`);
      return {
        ok: false,
        message: `복원 실패: ${error.message}`,
      };
    }
  });

  ipcMain.handle("desktop:get-last-restore-result", () => {
    return lastRestoreResult || null;
  });

  ipcMain.handle("desktop:check-for-updates", async () => {
    if (!autoUpdateEnabled) {
      return {
        ok: false,
        disabled: true,
        message: "현재 환경에서는 자동업데이트를 사용할 수 없습니다.",
      };
    }

    try {
      await autoUpdater.checkForUpdates();
      return { ok: true, started: true };
    } catch (error) {
      appendStartupLog(`[UPDATE] manual check failed: ${error.message}`);
      return {
        ok: false,
        message: `업데이트 확인 실패: ${error.message}`,
      };
    }
  });

  ipcMain.handle("desktop:quit-and-install-update", () => {
    if (!autoUpdateEnabled || !updateReadyToInstall) {
      return { ok: false, message: "설치 가능한 업데이트가 없습니다." };
    }
    setImmediate(() => {
      autoUpdater.quitAndInstall(false, true);
    });
    return { ok: true };
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  registerDesktopIpc();
  app.on("second-instance", () => {
    focusMainWindow();
  });

  app.whenReady().then(bootstrap).catch((error) => {
    appendStartupLog(`[BOOT_ERROR] ${error.message}`);
    console.error("[TimeTrack/Electron] bootstrap failed", error);
    createStartupFailureWindow(error);
  });
}

app.on("web-contents-created", (_event, contents) => {
  contents.on("will-attach-webview", (event) => {
    event.preventDefault();
    appendStartupLog("[WEBVIEW_BLOCKED] webview attachment denied");
  });
});

app.on("before-quit", (event) => {
  if (quitting || !apiServer) return;
  event.preventDefault();
  quitting = true;
  stopEmbeddedServer().finally(() => {
    app.exit(0);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && apiPort) {
    createMainWindow(apiPort);
  }
});
