require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/todo_db";

const todoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Todo = mongoose.model("Todo", todoSchema);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const status = mongoose.connection.readyState;
    if (status !== 1) {
      return res.status(500).json({ status: "db_disconnected" });
    }

    res.json({ status: "ok" });
  } catch (_error) {
    res.status(500).json({ status: "db_error" });
  }
});

app.get("/todos", async (_req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(
    todos.map((todo) => ({
      id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
    })),
  );
});

app.post("/todos", async (req, res) => {
  const text = (req.body?.text || "").trim();

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  const todo = await Todo.create({ text });

  return res.status(201).json({
    id: todo._id.toString(),
    text: todo.text,
    completed: todo.completed,
  });
});

app.put("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const completed = Boolean(req.body?.completed);

  const todo = await Todo.findByIdAndUpdate(
    id,
    { completed },
    { new: true, runValidators: true },
  );

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  return res.json({
    id: todo._id.toString(),
    text: todo.text,
    completed: todo.completed,
  });
});

app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const deletedTodo = await Todo.findByIdAndDelete(id);

  if (!deletedTodo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  return res.status(204).send();
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

mongoose
  .connect(mongoUrl)
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed:", error);
    process.exit(1);
  });
