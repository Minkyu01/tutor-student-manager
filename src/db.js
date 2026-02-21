const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const configuredDataDir = process.env.TIMETRACK_DATA_DIR
  ? path.resolve(process.env.TIMETRACK_DATA_DIR)
  : path.join(process.cwd(), "data");
if (!fs.existsSync(configuredDataDir)) {
  fs.mkdirSync(configuredDataDir, { recursive: true });
}

const dbFileName = process.env.TIMETRACK_DB_FILE || "timetrack.db";
const dbPath = path.join(configuredDataDir, dbFileName);
const db = new Database(dbPath);
const SCHEMA_VERSION = 1;
const WRITE_INTEGRITY_CHECK_WINDOW_MS = 30 * 1000;
let lastIntegrityCheckedAt = 0;

function buildRecoverySteps() {
  return [
    `DB 파일을 별도 위치로 복사해 보존하세요: ${dbPath}`,
    "정상 백업 파일이 있으면 앱의 복원 기능으로 교체하세요.",
    "복구 실패 시 startup.log와 DB 파일 사본으로 점검을 진행하세요.",
  ];
}

function createDbGuardError(code, message) {
  const error = new Error(message);
  error.code = code;
  error.recoverySteps = buildRecoverySteps();
  return error;
}

function tableColumns(tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function verifySchemaCompatibility() {
  const expectedSchema = {
    students: ["id", "name", "nickname", "phone", "memo", "is_active", "created_at", "updated_at"],
    lessons: [
      "id",
      "student_id",
      "start_at",
      "end_at",
      "status",
      "title",
      "memo",
      "origin_lesson_id",
      "created_at",
      "updated_at",
    ],
    pin_audit: ["id", "action", "success", "ip_hash", "created_at"],
  };

  const currentVersion = Number(db.pragma("user_version", { simple: true }) || 0);
  if (currentVersion > SCHEMA_VERSION) {
    throw createDbGuardError(
      "SCHEMA_VERSION_UNSUPPORTED",
      `DB schema version ${currentVersion} is newer than app-supported version ${SCHEMA_VERSION}`
    );
  }

  for (const [tableName, columns] of Object.entries(expectedSchema)) {
    const actualColumns = tableColumns(tableName);
    if (!actualColumns.length) {
      throw createDbGuardError("SCHEMA_INCOMPATIBLE", `Missing required table: ${tableName}`);
    }
    for (const columnName of columns) {
      if (!actualColumns.includes(columnName)) {
        throw createDbGuardError("SCHEMA_INCOMPATIBLE", `Missing required column: ${tableName}.${columnName}`);
      }
    }
  }

  if (currentVersion < SCHEMA_VERSION) {
    db.pragma(`user_version = ${SCHEMA_VERSION}`);
  }
}

function runIntegrityCheck() {
  const result = db.pragma("quick_check", { simple: true });
  if (result !== "ok") {
    throw createDbGuardError("DB_INTEGRITY_FAILED", `quick_check failed: ${result}`);
  }
  lastIntegrityCheckedAt = Date.now();
  return { ok: true, checkedAt: lastIntegrityCheckedAt };
}

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT,
  memo TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('normal', 'canceled', 'makeup')),
  title TEXT,
  memo TEXT,
  origin_lesson_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(student_id) REFERENCES students(id),
  FOREIGN KEY(origin_lesson_id) REFERENCES lessons(id)
);

CREATE TABLE IF NOT EXISTS pin_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  success INTEGER NOT NULL,
  ip_hash TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_nickname ON students(nickname);
CREATE INDEX IF NOT EXISTS idx_lessons_student_start ON lessons(student_id, start_at);
CREATE INDEX IF NOT EXISTS idx_lessons_start_end ON lessons(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_lessons_status_start ON lessons(status, start_at);
`);

const studentColumns = db.prepare("PRAGMA table_info(students)").all();
const hasPhoneColumn = studentColumns.some((column) => column.name === "phone");
if (!hasPhoneColumn) {
  db.exec("ALTER TABLE students ADD COLUMN phone TEXT");
}
db.exec("CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone)");
verifySchemaCompatibility();
runIntegrityCheck();

db.dataDir = configuredDataDir;
db.dbPath = dbPath;
db.schemaVersion = SCHEMA_VERSION;
db.ensureWriteSessionHealthy = (force = false) => {
  const now = Date.now();
  if (force || now - lastIntegrityCheckedAt >= WRITE_INTEGRITY_CHECK_WINDOW_MS) {
    return runIntegrityCheck();
  }
  return { ok: true, checkedAt: lastIntegrityCheckedAt };
};

module.exports = db;
