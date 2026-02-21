const db = require("../src/db");

const countStmt = db.prepare("SELECT COUNT(*) AS count FROM students WHERE is_active = 0");
const updateStmt = db.prepare("UPDATE students SET is_active = 1, updated_at = ? WHERE is_active = 0");

const before = countStmt.get().count;
const now = new Date().toISOString();
const result = updateStmt.run(now);
const after = countStmt.get().count;

console.log(`[migrate-students-active] before_inactive=${before}`);
console.log(`[migrate-students-active] updated=${result.changes}`);
console.log(`[migrate-students-active] after_inactive=${after}`);
