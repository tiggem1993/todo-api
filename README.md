# ToDo API — Node.js + Express + MongoDB (Mongoose)

A clean, scalable REST API for managing todos, built with:

- Node.js
- Express
- MongoDB + Mongoose
- Service-layer architecture
- Global error handling & async middleware
- Joi validation
- JWT authentication

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Scripts](#scripts)
8. [Getting Started / Run](#getting-started--run)
9. [API Endpoints](#api-endpoints)
10. [Authentication (JWT)](#authentication-jwt)
11. [Models (example schemas)](#models-example-schemas)
12. [Validation (Joi) — examples](#validation-joi---examples)
13. [Controllers / Services / Middlewares — patterns & examples](#controllers--services--middlewares---patterns--examples)
14. [Postman collection (how-to)](#postman-collection-how-to)
15. [Examples (curl)](#examples-curl)
16. [Troubleshooting](#troubleshooting)
17. [Contributing](#contributing)
18. [License](#license)

---

# Introduction

This repository implements a RESTful ToDo API with a clean separation of concerns (controllers → services → models), centralized error handling, async middleware wrapper, request validation using Joi, and JWT-based authentication for protected routes.

---

# Features

- CRUD for todos (`/api/todos`)
- User registration & login with JWT (`/api/auth`)
- Joi request validation
- Service layer for business logic
- Centralized error handling
- Async wrapper to handle `async/await` rejections
- Proper HTTP status codes
- Scalable folder structure

---

# Tech Stack

- Node.js (v16+ recommended)
- Express
- MongoDB (Atlas or self-hosted)
- Mongoose
- Joi (validation)
- jsonwebtoken (JWT)
- dotenv

---

# Folder Structure

```
src/
  controllers/
  services/
  routes/
  models/
  middlewares/
  utils/
app.js
server.js
```

- `controllers/` — receives requests, calls services, handles responses
- `services/` — business logic & DB interactions via models
- `routes/` — Express routers
- `models/` — Mongoose schemas
- `middlewares/` — auth, error handler, async wrapper, validation
- `utils/` — helpers (JWT generation, response helpers, constants)
- `app.js` — Express app setup (middlewares, routes)
- `server.js` — server bootstrap (connect to DB, start server)

---

# Installation

```bash
# install dependencies
npm install
```

Create a `.env` file at project root:

```
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
PORT=5000
```

---

# Scripts (package.json)

Example `package.json` scripts section:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint . --ext .js",
    "test": "jest"
  }
}
```

---

# Getting Started / Run

Start development server:

```bash
npm run dev
```

Start production:

```bash
npm start
```

The API will run on port from `PORT` env (default `5000`).

---

# API Endpoints

| Method | Endpoint             | Description     | Auth |
| ------ | -------------------- | --------------- | ---- |
| GET    | `/api/todos`         | Get all todos   | Yes  |
| GET    | `/api/todos/:id`     | Get todo by ID  | Yes  |
| POST   | `/api/todos`         | Create new todo | Yes  |
| PUT    | `/api/todos/:id`     | Update todo     | Yes  |
| DELETE | `/api/todos/:id`     | Delete todo     | Yes  |
| POST   | `/api/auth/register` | Register user   | No   |
| POST   | `/api/auth/login`    | Login user      | No   |

> Protected routes expect `Authorization: Bearer <token>` header.

---

# Authentication (JWT)

- On `POST /api/auth/register` — create user (email, password hashed)
- On `POST /api/auth/login` — verify credentials, return token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

Use token in requests:

```
Authorization: Bearer <token>
```

Token generation sample (utils/jwt.js):

```js
const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
```

---

# Models (example schemas)

`models/User.js` (Mongoose):

```js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

`models/Todo.js`:

```js
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
```

---

# Validation (Joi) — examples

`validation/auth.js`:

```js
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
```

`validation/todo.js`:

```js
const Joi = require("joi");

const createTodo = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  completed: Joi.boolean().optional(),
});

const updateTodo = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  completed: Joi.boolean().optional(),
});

module.exports = { createTodo, updateTodo };
```

Use a middleware to validate request body and return `400` on failure.

---

# Controllers / Services / Middlewares — patterns & examples

## Async wrapper middleware

`middlewares/asyncHandler.js`:

```js
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Auth middleware (protect routes)

`middlewares/auth.js`:

```js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
```

## Error handler (global)

`middlewares/errorHandler.js`:

```js
module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
```

## Controller -> Service pattern

Controller (thin):

```js
const asyncHandler = require("../middlewares/asyncHandler");
const todoService = require("../services/todoService");

exports.getTodos = asyncHandler(async (req, res) => {
  const todos = await todoService.getAll(req.user._id);
  res.json(todos);
});
```

Service (business logic):

```js
const Todo = require("../models/Todo");

exports.getAll = async (userId) => {
  return Todo.find({ user: userId }).sort({ createdAt: -1 });
};
```

---

# Postman collection (how-to)

You mentioned a `postman-collection.json` — if you have it, import it into Postman via _Import → File_.
If it's not yet provided, save the following minimal JSON as `postman-collection.json` and import it:

```json
{
  "info": {
    "name": "ToDo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"password\":\"password123\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/register",
          "host": ["http://localhost:5000"],
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"alice@example.com\",\"password\":\"password123\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/login",
          "host": ["http://localhost:5000"],
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

> Replace host/URLs with your deployed URL when necessary.

---

# Examples (curl)

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Create todo (after obtaining token):

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Buy milk","description":"2 liters"}'
```

Get all todos:

```bash
curl http://localhost:5000/api/todos -H "Authorization: Bearer <TOKEN>"
```

---

# Troubleshooting

- `MongoNetworkError` — check `MONGO_URI` and network/whitelist for Atlas.
- `E11000 duplicate key` on register — email already exists.
- `JWT malformed` or `invalid signature` — verify `JWT_SECRET` is same for signing and verifying.
- `ValidationError` (Joi) — check request body shape and required fields.

---

# Contributing

1. Fork repository
2. Create branch: `feature/your-feature`
3. Commit & push, open PR with description and testing steps

Suggested rules:

- Keep controllers thin
- Put logic in services
- Add tests for new features
- Update Postman collection on API change

---

# License

MIT License — feel free to copy/modify for private or commercial projects.

---

If you'd like, I can also:

- Generate a ready-to-use `postman-collection.json` with all endpoints (I can paste the full JSON here),
- Produce example files for `app.js`, `server.js`, route files, or a working minimal repository layout you can drop into a project.

Tell me which of those you'd like and I'll include the concrete files next in this chat.
