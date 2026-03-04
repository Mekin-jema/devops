import express from "express"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const app= express()
const todos = []
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TODO_DIR = path.join(__dirname, "todo")
const TODO_FILE = path.join(TODO_DIR, "todo.txt")
const SWAPI_BASE_URL = "https://swapi.dev/api"
const SWAPI_RESOURCES = new Set(["people", "films", "starships", "vehicles", "species", "planets"])
const DUMMY_API_BASE_URL = "https://jsonplaceholder.typicode.com"


app.use(express.json()      )
app.use(express.urlencoded({ extended: true }))

const parseTodosFromText = (text) =>
    text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)

const todosToText = (items) => items.join("\n")

const ensureTodoStorage = async () => {
    await fs.mkdir(TODO_DIR, { recursive: true })

    try {
        await fs.access(TODO_FILE)
    } catch {
        await fs.writeFile(TODO_FILE, "", "utf8")
    }
}

const loadTodos = async () => {
    await ensureTodoStorage()
    const content = await fs.readFile(TODO_FILE, "utf8")
    todos.splice(0, todos.length, ...parseTodosFromText(content))
}

const saveTodos = async () => {
    await fs.writeFile(TODO_FILE, todosToText(todos), "utf8")
}

const requestLogger = (req, res, next) => {
    const now = new Date().toISOString()
    console.log(`[${now}] ${req.method} ${req.url}`)
    next()
}

const validateTodo = (req, res, next) => {
    const text = req.body.todo?.trim().replace(/\s+/g, " ")

    if (!text) {
        return res.status(400).send("Todo is required. Go back and enter a value.")
    }

    req.todoText = text
    next()
}

const validateTodoIndex = (req, res, next) => {
    const index = Number(req.params.index)

    if (!Number.isInteger(index) || index < 0 || index >= todos.length) {
        return res.status(404).send("Todo not found.")
    }

    req.todoIndex = index
    next()
}

const escapeHtml = (value) =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")

app.use(requestLogger)

const buildSwapiUrl = (resource, id, search, page) => {
    const cleanResource = String(resource || "").trim().toLowerCase()

    if (!SWAPI_RESOURCES.has(cleanResource)) {
        return null
    }

    const idPart = id ? `/${encodeURIComponent(String(id).trim())}` : ""
    const url = new URL(`${SWAPI_BASE_URL}/${cleanResource}${idPart}/`)

    if (search) {
        url.searchParams.set("search", String(search).trim())
    }

    if (page) {
        url.searchParams.set("page", String(page).trim())
    }

    return url
}

const fetchSwapi = async (url) => {
    const response = await fetch(url)

    if (!response.ok) {
        const error = new Error(`SWAPI request failed with status ${response.status}`)
        error.status = response.status
        throw error
    }

    return response.json()
}

app.get("/api/swapi/:resource", async (req, res, next) => {
    try {
        const { resource } = req.params
        const { search, page } = req.query
        const url = buildSwapiUrl(resource, null, search, page)

        if (!url) {
            return res.status(400).json({
                error: "Invalid SWAPI resource.",
                supportedResources: [...SWAPI_RESOURCES]
            })
        }

        const data = await fetchSwapi(url)
        res.json(data)
    } catch (error) {
        next(error)
    }
})

app.get("/api/swapi/:resource/:id", async (req, res, next) => {
    try {
        const { resource, id } = req.params
        const url = buildSwapiUrl(resource, id)

        if (!url) {
            return res.status(400).json({
                error: "Invalid SWAPI resource.",
                supportedResources: [...SWAPI_RESOURCES]
            })
        }

        const data = await fetchSwapi(url)
        res.json(data)
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({ error: "SWAPI record not found." })
        }

        next(error)
    }
})

app.get("/api/dummy/posts", async (req, res, next) => {
    try {
        const { userId, limit } = req.query
        const url = new URL(`${DUMMY_API_BASE_URL}/posts`)

        if (userId) {
            url.searchParams.set("userId", String(userId).trim())
        }

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Dummy API request failed with status ${response.status}`)
        }

        const data = await response.json()
        const safeLimit = Number(limit)

        if (Number.isInteger(safeLimit) && safeLimit > 0) {
            return res.json(data.slice(0, safeLimit))
        }

        res.json(data)
    } catch (error) {
        next(error)
    }
})

app.get("/api/dummy/posts/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const response = await fetch(`${DUMMY_API_BASE_URL}/posts/${encodeURIComponent(id)}`)

        if (response.status === 404) {
            return res.status(404).json({ error: "Dummy post not found." })
        }

        if (!response.ok) {
            throw new Error(`Dummy API request failed with status ${response.status}`)
        }

        const data = await response.json()
        res.json(data)
    } catch (error) {
        next(error)
    }
})


app.get("/",( req, res )=>{
    const editIndex = Number(req.query.edit)
    const isEditing = Number.isInteger(editIndex) && editIndex >= 0 && editIndex < todos.length

    const todoItems = todos
        .map((todo, index) => `
            <li>
                <div class="todo-row">
                    <span><strong>#${index + 1}</strong> ${escapeHtml(todo)}</span>
                    <div class="actions">
                        <a class="link-btn" href="/?edit=${index}">Edit</a>
                        <form action="/todos/${index}/delete" method="post">
                            <button class="danger" type="submit">Delete</button>
                        </form>
                    </div>
                </div>
            </li>
        `)
        .join("")

    const page=`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Todo List</title>
        <style>
            * { box-sizing: border-box; }
            body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                background: radial-gradient(circle at 20% 20%, #22c55e 0%, transparent 35%),
                                radial-gradient(circle at 80% 0%, #3b82f6 0%, transparent 35%),
                                linear-gradient(135deg, #0f172a 0%, #111827 50%, #1f2937 100%);
                color: #f8fafc;
            }

            .card {
                width: min(92vw, 560px);
                padding: 28px;
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.18);
                backdrop-filter: blur(16px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
            }

            h1 {
                margin: 0 0 6px;
                font-size: 1.7rem;
                font-weight: 700;
                letter-spacing: 0.3px;
            }

            p {
                margin: 0 0 20px;
                color: #cbd5e1;
                font-size: 0.95rem;
            }

            form {
                display: flex;
                gap: 10px;
                margin-bottom: 18px;
            }

            .input {
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(15, 23, 42, 0.55);
                color: #f8fafc;
                padding: 12px 14px;
                border-radius: 12px;
                font-size: 0.95rem;
                transition: 180ms ease;
            }

            .input::placeholder {
                color: #94a3b8;
            }

            .input:focus {
                outline: none;
                border-color: #60a5fa;
                box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
            }

            button {
                border: none;
                padding: 12px 16px;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                color: white;
                background: linear-gradient(135deg, #10b981, #3b82f6);
                transition: transform 120ms ease, box-shadow 120ms ease;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
                white-space: nowrap;
            }

            button:hover {
                transform: translateY(-1px);
                box-shadow: 0 12px 28px rgba(59, 130, 246, 0.45);
            }

            ul {
                margin: 0;
                padding-left: 18px;
                display: grid;
                gap: 8px;
            }

            li {
                color: #e2e8f0;
                list-style: none;
                margin-left: -18px;
            }

            .todo-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                background: rgba(15, 23, 42, 0.45);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 10px;
                padding: 10px 12px;
            }

            .actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .actions form {
                margin: 0;
            }

            .link-btn {
                text-decoration: none;
                color: white;
                background: #2563eb;
                border-radius: 8px;
                padding: 8px 10px;
                font-size: 0.86rem;
                font-weight: 600;
            }

            .danger {
                background: linear-gradient(135deg, #ef4444, #b91c1c);
                padding: 8px 10px;
                border-radius: 8px;
                box-shadow: none;
                font-size: 0.86rem;
            }

            .danger:hover {
                box-shadow: none;
            }

            .empty {
                color: #94a3b8;
            }

            .edit-box {
                margin-top: 14px;
                border-top: 1px solid rgba(148, 163, 184, 0.28);
                padding-top: 14px;
            }

            .edit-box h3 {
                margin: 0 0 10px;
            }

            .cancel {
                color: #93c5fd;
                font-size: 0.88rem;
            }

            .meta {
                margin-top: 12px;
                text-align: center;
                font-size: 0.82rem;
                color: #94a3b8;
            }
        </style>
    </head>
    <body>
        <section class="card">
            <h1> My Todo List  ✅</h1>
            <p>Add tasks and view every item you submit.</p>
            <form action="/todos" method="post">
                <input class="input" type="text" name="todo" placeholder="Enter a todo" required>
                <button type="submit">Add Todo</button>
            </form>

            ${todos.length
                ? `<ul>${todoItems}</ul>`
                : `<div class="empty">No todos yet. Add your first task.</div>`}

            ${isEditing
                ? `
                <section class="edit-box">
                    <h3>Edit Todo #${editIndex + 1}</h3>
                    <form action="/todos/${editIndex}/update" method="post">
                        <input class="input" type="text" name="todo" value="${escapeHtml(todos[editIndex])}" required>
                        <button type="submit">Update Todo</button>
                    </form>
                    <a class="cancel" href="/">Cancel edit</a>
                </section>
                `
                : ""}

            <div class="meta">Express middleware + HTML form</div>
        </section>
    </body>
    </html>`

   res.send(page)
})

app.post("/todos", validateTodo, async (req, res, next) => {
    try {
    todos.push(req.todoText)
    await saveTodos()
    res.redirect("/")
    } catch (error) {
        next(error)
    }
})

app.post("/todos/:index/update", validateTodoIndex, validateTodo, async (req, res, next) => {
    try {
    todos[req.todoIndex] = req.todoText
    await saveTodos()
    res.redirect("/")
    } catch (error) {
        next(error)
    }
})

app.post("/todos/:index/delete", validateTodoIndex, async (req, res, next) => {
    try {
    todos.splice(req.todoIndex, 1)
    await saveTodos()
    res.redirect("/")
    } catch (error) {
        next(error)
    }
})

app.use((error, req, res, next) => {
    console.error(error)
    res.status(500).send("Internal server error.")
})

const startServer = async () => {
    try {
        await loadTodos()
        app.listen(3000,()=>{
            console.log("Server is running on port 3000")
            console.log(`Todo file: ${TODO_FILE}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

startServer()