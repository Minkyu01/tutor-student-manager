const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "timetrackDesktop",
  Object.freeze({
    platform: process.platform,
    isDesktop: true,
    createBackup: () => ipcRenderer.invoke("desktop:create-backup"),
    restoreBackup: () => ipcRenderer.invoke("desktop:restore-backup"),
    getLastRestoreResult: () => ipcRenderer.invoke("desktop:get-last-restore-result"),
    checkForUpdates: () => ipcRenderer.invoke("desktop:check-for-updates"),
    quitAndInstallUpdate: () => ipcRenderer.invoke("desktop:quit-and-install-update"),
    onUpdateStatus: (handler) => {
      if (typeof handler !== "function") return () => {};
      const listener = (_event, payload) => handler(payload);
      ipcRenderer.on("desktop:update-status", listener);
      return () => ipcRenderer.removeListener("desktop:update-status", listener);
    },
  })
);
