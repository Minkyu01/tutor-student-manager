const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "timetrack.db");
const db = new Database(dbPath);

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

module.exports = db;
