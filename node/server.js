import express from "express"

const app= express()


app.use(express.json()      )
app.use(express.urlencoded({ extended: true }))


app.get("/",( req, res )=>{
    const loginForm=`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login</title>
        <style>
            * { box-sizing: border-box; }
            body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                background: radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 35%),
                                radial-gradient(circle at 80% 0%, #8b5cf6 0%, transparent 35%),
                                linear-gradient(135deg, #0f172a 0%, #111827 50%, #1f2937 100%);
                color: #f8fafc;
            }

            .card {
                width: min(92vw, 400px);
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
                display: grid;
                gap: 14px;
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
                padding: 12px 14px;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                color: white;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                transition: transform 120ms ease, box-shadow 120ms ease;
                box-shadow: 0 10px 25px rgba(59, 130, 246, 0.35);
            }

            button:hover {
                transform: translateY(-1px);
                box-shadow: 0 12px 28px rgba(139, 92, 246, 0.45);
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
            <h1>Welcome back!  👋</h1>
            <p>Sign in to continue to your dashboard.</p>
            <form action="/login" method="post">
                <input class="input" type="text" name="username" placeholder="Username" required>
                <input class="input" type="password" name="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <div class="meta">Secure access • Modern UI</div>
        </section>
    </body>
    </html>`

   res.send(loginForm)
})

app.post("/login", (req, res) => {
    const username = req.body.username || "user"

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Logged in</title>
        <style>
            body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                font-family: Inter, system-ui, sans-serif;
                background: #0f172a;
                color: #e2e8f0;
            }
            .ok {
                background: #111827;
                border: 1px solid #334155;
                border-radius: 14px;
                padding: 20px 24px;
            }
            a {
                color: #60a5fa;
            }
        </style>
    </head>
    <body>
        <div class="ok">✅ Hello, <strong>${username}</strong>. You are logged in. <a href="/">Back</a></div>
    </body>
    </html>
    `)
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})  