const express = require("express");
const bodyParser = require("body-parser");
const {
  addReminder,
  getReminders,
  updateReminder,
  deleteReminder,
} = require("./database");

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post("/api/reminders", async (req, res) => {
  const { text } = req.body;
  try {
    const id = await addReminder(text);
    res.status(201).send({ id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/api/reminders", async (req, res) => {
  try {
    const reminders = await getReminders();
    res.send(reminders);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/api/reminders/:id", async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  try {
    await updateReminder(id, done);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete("/api/reminders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteReminder(id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
