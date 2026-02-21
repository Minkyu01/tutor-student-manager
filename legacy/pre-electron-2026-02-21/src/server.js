const path = require("path");
const crypto = require("crypto");
const express = require("express");
const dayjs = require("dayjs");
const db = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);
const APP_PIN = process.env.APP_PIN || "1234";

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

const writeTokens = new Map();
const pinAttempts = new Map();
const PIN_LOCK_THRESHOLD = 5;
const PIN_LOCK_MS = 60 * 1000;
const TOKEN_TTL_MS = 15 * 60 * 1000;

function id() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function clientKey(req) {
  return req.ip || "unknown";
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, expiresAt] of writeTokens.entries()) {
    if (expiresAt <= now) writeTokens.delete(token);
  }
}

function writeAudit(action, success, req) {
  db.prepare(
    "INSERT INTO pin_audit (id, action, success, ip_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id(), action, success ? 1 : 0, clientKey(req), nowIso());
}

function requireWriteAuth(req, res, next) {
  cleanupExpiredTokens();
  const token = req.header("x-write-token");
  if (!token || !writeTokens.has(token)) {
    return res.status(401).json({ error: "PIN verification required" });
  }
  next();
}

function lessonValidation(body) {
  const required = ["student_id", "start_at", "end_at", "status"];
  for (const key of required) {
    if (!body[key]) return `${key} is required`;
  }
  if (!["normal", "canceled", "makeup"].includes(body.status)) {
    return "status must be normal|canceled|makeup";
  }
  const start = new Date(body.start_at).getTime();
  const end = new Date(body.end_at).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return "start_at/end_at must be valid ISO datetime";
  }
  if (end <= start) return "end_at must be greater than start_at";
  return null;
}

function toActiveFlag(value, fallback = 1) {
  if (value === undefined) return fallback;
  if (value === null) return fallback;
  if (value === false || value === 0 || value === "0") return 0;
  return 1;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now: nowIso() });
});

app.post("/api/pin/verify", (req, res) => {
  const key = clientKey(req);
  const state = pinAttempts.get(key) || { failures: 0, lockedUntil: 0 };
  const now = Date.now();

  if (state.lockedUntil > now) {
    return res.status(429).json({
      error: "PIN temporarily locked",
      retryAfterMs: state.lockedUntil - now,
    });
  }

  const pin = String(req.body.pin || "");
  if (pin !== APP_PIN) {
    state.failures += 1;
    if (state.failures >= PIN_LOCK_THRESHOLD) {
      state.failures = 0;
      state.lockedUntil = now + PIN_LOCK_MS;
    }
    pinAttempts.set(key, state);
    writeAudit("pin_verify", false, req);
    return res.status(401).json({ error: "Invalid PIN" });
  }

  pinAttempts.set(key, { failures: 0, lockedUntil: 0 });
  const token = crypto.randomBytes(18).toString("base64url");
  writeTokens.set(token, now + TOKEN_TTL_MS);
  writeAudit("pin_verify", true, req);
  return res.json({ token, expiresInMs: TOKEN_TTL_MS });
});

app.get("/api/students", (req, res) => {
  const query = String(req.query.query || "").trim();
  const filter = String(req.query.filter || "all");
  const from = String(req.query.from || "");
  const to = String(req.query.to || "");

  const where = [];
  const params = {};
  if (from && to) {
    params.from = from;
    params.to = to;
  }

  if (query) {
    where.push("(s.name LIKE @q OR s.nickname LIKE @q)");
    params.q = `%${query}%`;
  }
  if (filter === "hasCanceled" && from && to) {
    where.push(
      "EXISTS (SELECT 1 FROM lessons l WHERE l.student_id = s.id AND l.status='canceled' AND l.start_at >= @from AND l.start_at < @to)"
    );
  }
  if (filter === "hasMakeup" && from && to) {
    where.push(
      "EXISTS (SELECT 1 FROM lessons l WHERE l.student_id = s.id AND l.status='makeup' AND l.start_at >= @from AND l.start_at < @to)"
    );
  }
  if (filter === "active") {
    where.push("s.is_active = 1");
  }
  if (filter === "inactive") {
    where.push("s.is_active = 0");
  }

  const sql = `
    SELECT
      s.*,
      COALESCE(SUM(CASE WHEN l.status='canceled' ${from && to ? "AND l.start_at >= @from AND l.start_at < @to" : ""} THEN 1 ELSE 0 END), 0) AS canceled_count,
      COALESCE(SUM(CASE WHEN l.status='makeup' ${from && to ? "AND l.start_at >= @from AND l.start_at < @to" : ""} THEN 1 ELSE 0 END), 0) AS makeup_count
    FROM students s
    LEFT JOIN lessons l ON l.student_id = s.id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY s.id
    ORDER BY s.name ASC
  `;

  const rows = db.prepare(sql).all(params);
  res.json(rows);
});

app.post("/api/students", requireWriteAuth, (req, res) => {
  const name = String(req.body.name || "").trim();
  const nickname = req.body.nickname ? String(req.body.nickname).trim() : null;
  const phone = req.body.phone ? String(req.body.phone).trim() : null;
  const memo = req.body.memo ? String(req.body.memo).trim() : null;

  if (!name) return res.status(400).json({ error: "name is required" });

  const student = {
    id: id(),
    name,
    nickname,
    phone,
    memo,
    is_active: toActiveFlag(req.body.is_active, 1),
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  db.prepare(
    `INSERT INTO students (id, name, nickname, phone, memo, is_active, created_at, updated_at)
     VALUES (@id, @name, @nickname, @phone, @memo, @is_active, @created_at, @updated_at)`
  ).run(student);

  res.status(201).json(student);
});

app.patch("/api/students/:id", requireWriteAuth, (req, res) => {
  const idParam = req.params.id;
  const existing = db.prepare("SELECT * FROM students WHERE id=?").get(idParam);
  if (!existing) return res.status(404).json({ error: "student not found" });

  const next = {
    ...existing,
    name: req.body.name !== undefined ? String(req.body.name).trim() : existing.name,
    nickname:
      req.body.nickname !== undefined ? String(req.body.nickname || "").trim() || null : existing.nickname,
    phone: req.body.phone !== undefined ? String(req.body.phone || "").trim() || null : existing.phone,
    memo: req.body.memo !== undefined ? String(req.body.memo || "").trim() || null : existing.memo,
    is_active: toActiveFlag(req.body.is_active, existing.is_active),
    updated_at: nowIso(),
  };

  if (!next.name) return res.status(400).json({ error: "name is required" });

  db.prepare(
    `UPDATE students
     SET name=@name, nickname=@nickname, phone=@phone, memo=@memo, is_active=@is_active, updated_at=@updated_at
     WHERE id=@id`
  ).run(next);

  res.json(next);
});

app.delete("/api/students/:id", requireWriteAuth, (req, res) => {
  const studentId = req.params.id;
  const existing = db.prepare("SELECT id FROM students WHERE id=?").get(studentId);
  if (!existing) return res.status(404).json({ error: "student not found" });

  const removeStudentTx = db.transaction((idValue) => {
    // Prevent FK conflicts for lessons referencing removed lesson ids.
    db.prepare(
      `UPDATE lessons
       SET origin_lesson_id = NULL, updated_at = ?
       WHERE origin_lesson_id IN (SELECT id FROM lessons WHERE student_id = ?)`
    ).run(nowIso(), idValue);

    db.prepare("DELETE FROM lessons WHERE student_id=?").run(idValue);
    return db.prepare("DELETE FROM students WHERE id=?").run(idValue);
  });

  const result = removeStudentTx(studentId);
  if (!result.changes) return res.status(404).json({ error: "student not found" });
  return res.status(204).end();
});

app.get("/api/lessons", (req, res) => {
  const from = String(req.query.from || "");
  const to = String(req.query.to || "");
  const studentId = String(req.query.studentId || "");
  const status = String(req.query.status || "");

  const where = [];
  const params = {};
  if (from) {
    where.push("l.start_at >= @from");
    params.from = from;
  }
  if (to) {
    where.push("l.start_at < @to");
    params.to = to;
  }
  if (studentId) {
    where.push("l.student_id = @studentId");
    params.studentId = studentId;
  }
  if (status) {
    where.push("l.status = @status");
    params.status = status;
  }

  const sql = `
    SELECT l.*, s.name AS student_name, s.nickname AS student_nickname
    FROM lessons l
    JOIN students s ON s.id = l.student_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY l.start_at ASC
  `;
  res.json(db.prepare(sql).all(params));
});

app.post("/api/lessons", requireWriteAuth, (req, res) => {
  const err = lessonValidation(req.body || {});
  if (err) return res.status(400).json({ error: err });

  const student = db.prepare("SELECT id FROM students WHERE id=?").get(req.body.student_id);
  if (!student) return res.status(400).json({ error: "student not found" });

  const lesson = {
    id: id(),
    student_id: req.body.student_id,
    start_at: req.body.start_at,
    end_at: req.body.end_at,
    status: req.body.status,
    title: req.body.title ? String(req.body.title).trim() : null,
    memo: req.body.memo ? String(req.body.memo).trim() : null,
    origin_lesson_id: req.body.origin_lesson_id || null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  db.prepare(
    `INSERT INTO lessons
     (id, student_id, start_at, end_at, status, title, memo, origin_lesson_id, created_at, updated_at)
     VALUES
     (@id, @student_id, @start_at, @end_at, @status, @title, @memo, @origin_lesson_id, @created_at, @updated_at)`
  ).run(lesson);

  res.status(201).json(lesson);
});

app.patch("/api/lessons/:id", requireWriteAuth, (req, res) => {
  const current = db.prepare("SELECT * FROM lessons WHERE id=?").get(req.params.id);
  if (!current) return res.status(404).json({ error: "lesson not found" });

  const merged = {
    ...current,
    student_id: req.body.student_id !== undefined ? req.body.student_id : current.student_id,
    start_at: req.body.start_at !== undefined ? req.body.start_at : current.start_at,
    end_at: req.body.end_at !== undefined ? req.body.end_at : current.end_at,
    status: req.body.status !== undefined ? req.body.status : current.status,
    title: req.body.title !== undefined ? String(req.body.title || "").trim() || null : current.title,
    memo: req.body.memo !== undefined ? String(req.body.memo || "").trim() || null : current.memo,
    origin_lesson_id:
      req.body.origin_lesson_id !== undefined ? req.body.origin_lesson_id || null : current.origin_lesson_id,
    updated_at: nowIso(),
  };

  const err = lessonValidation(merged);
  if (err) return res.status(400).json({ error: err });

  db.prepare(
    `UPDATE lessons
     SET student_id=@student_id, start_at=@start_at, end_at=@end_at, status=@status, title=@title, memo=@memo, origin_lesson_id=@origin_lesson_id, updated_at=@updated_at
     WHERE id=@id`
  ).run(merged);

  res.json(merged);
});

app.delete("/api/lessons/:id", requireWriteAuth, (req, res) => {
  const result = db.prepare("DELETE FROM lessons WHERE id=?").run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: "lesson not found" });
  res.status(204).end();
});

app.get("/api/summary", (req, res) => {
  const from = String(req.query.from || "");
  const to = String(req.query.to || "");
  if (!from || !to) return res.status(400).json({ error: "from and to are required" });

  const counts = db
    .prepare(
      `SELECT
        SUM(CASE WHEN status='canceled' THEN 1 ELSE 0 END) AS canceled,
        SUM(CASE WHEN status='makeup' THEN 1 ELSE 0 END) AS makeup
      FROM lessons
      WHERE start_at >= ? AND start_at < ?`
    )
    .get(from, to);

  const items = db
    .prepare(
      `SELECT l.id, l.status, l.start_at, l.end_at, l.title, s.name AS student_name, s.nickname AS student_nickname
       FROM lessons l
       JOIN students s ON s.id = l.student_id
       WHERE l.start_at >= ? AND l.start_at < ? AND l.status IN ('canceled', 'makeup')
       ORDER BY l.start_at ASC`
    )
    .all(from, to);

  res.json({
    canceled: Number(counts.canceled || 0),
    makeup: Number(counts.makeup || 0),
    items,
  });
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(port, () => {
  console.log(`[TimeTrack] running on http://localhost:${port} (${dayjs().format("YYYY-MM-DD HH:mm:ss")})`);
});
