const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "TIMETRACK_DATA_DIR=$(mktemp -d /tmp/timetrack-e2e-XXXXXX) node src/server.js",
    url: "http://127.0.0.1:3000/api/health",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
