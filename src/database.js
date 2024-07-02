const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("reminders.db"); // Используем файл для постоянного хранения

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY, text TEXT, done INTEGER)",
  );
});

const addReminder = (text, done = 0) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO reminders (text, done) VALUES (?, ?)",
      [text, done],
      function (err) {
        if (err) reject(err);
        resolve(this.lastID);
      },
    );
  });
};

const getReminders = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM reminders", (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

const updateReminder = (id, done) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE reminders SET done = ? WHERE id = ?",
      [done, id],
      function (err) {
        if (err) reject(err);
        resolve();
      },
    );
  });
};

const deleteReminder = (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM reminders WHERE id = ?", [id], function (err) {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = { addReminder, getReminders, updateReminder, deleteReminder };
