"use client";

import { FormEvent, useEffect, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTodos() {
    const res = await fetch(`${API_URL}/todos`, { cache: "no-store" });
    const data: Todo[] = await res.json();
    setTodos(data);
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function onAddTodo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();

    if (!value) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });

      setText("");
      await loadTodos();
    } finally {
      setLoading(false);
    }
  }

  async function onToggleTodo(todo: Todo) {
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    await loadTodos();
  }

  async function onDeleteTodo(id: string) {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
    await loadTodos();
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6">
      <section className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900">Todo App</h1>

        <form className="mb-4 flex gap-2" onSubmit={onAddTodo}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-600"
            placeholder="Add a task..."
          />
          <button
            disabled={loading}
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            Add
          </button>
        </form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggleTodo(todo)}
                />
                <span className={todo.completed ? "text-zinc-400 line-through" : "text-zinc-800"}>
                  {todo.text}
                </span>
              </label>

              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="rounded bg-red-500 px-2 py-1 text-sm text-white"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
