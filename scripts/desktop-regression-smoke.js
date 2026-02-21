const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      ...options,
    });
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) return resolve({ stdout, stderr });
      return reject(new Error(stderr || `${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function verifyLocalDbPathBehavior() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "timetrack-desktop-dbpath-"));
  const dataDir = path.join(tempRoot, "data");
  fs.mkdirSync(dataDir, { recursive: true });

  try {
    const probeScript = `
      const db = require('./src/db');
      console.log(JSON.stringify({
        dataDir: db.dataDir,
        dbPath: db.dbPath,
        schemaVersion: db.schemaVersion
      }));
    `;
    const { stdout } = await runCapture(process.execPath, ["-e", probeScript], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        TIMETRACK_DATA_DIR: dataDir,
      },
    });

    const lastLine = stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .at(-1);
    assert.ok(lastLine, "db probe output should exist");
    const parsed = JSON.parse(lastLine);
    const expectedDataDir = path.resolve(dataDir);
    const expectedDbPath = path.join(expectedDataDir, "timetrack.db");

    assert.equal(parsed.dataDir, expectedDataDir, "db.dataDir should match override path");
    assert.equal(parsed.dbPath, expectedDbPath, "db.dbPath should resolve under override path");
    assert.equal(parsed.schemaVersion, 1, "schema version should be 1");
    assert.equal(fs.existsSync(expectedDbPath), true, "sqlite file should be created under override path");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function run() {
  console.log("[desktop-smoke] verify local DB path behavior");
  await verifyLocalDbPathBehavior();
  console.log("[desktop-smoke] local DB path checks passed");
}

run().catch((error) => {
  console.error(`[desktop-smoke] failed: ${error.message}`);
  process.exit(1);
});
