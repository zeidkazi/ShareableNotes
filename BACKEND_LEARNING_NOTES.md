# Backend Development Learning Notes
## Full-Stack Notes App - Day 1

---

## 📚 TABLE OF CONTENTS
1. [Project Structure](#project-structure)
2. [Prisma & Database](#prisma--database)
3. [Express.js Basics](#expressjs-basics)
4. [Backend Architecture](#backend-architecture)
5. [Common Errors & Solutions](#common-errors--solutions)
6. [Key Concepts](#key-concepts)
7. [API Endpoints Summary](#api-endpoints-summary)

---

## 🏗️ PROJECT STRUCTURE

### Monorepo Setup (Turborepo)
```
notesApp/
├── apps/
│   ├── web/          # React 19 + Vite frontend
│   └── server/       # Express backend
├── packages/         # Shared code
└── .env              # Root-level environment variables
```

### Backend Folder Structure
```
apps/server/src/
├── config/
│   └── prisma.ts          # Prisma Client singleton
├── routes/
│   └── notes.routes.ts    # API route definitions
├── controllers/
│   └── notes.controller.ts # HTTP request/response handling
├── services/
│   └── notes.service.ts    # Business logic & database operations
├── utils/
│   └── idGenerator.ts      # Helper functions
└── index.ts                # Server entry point
```

**Why this structure?**
- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Can test services without HTTP
- **Maintainability**: Easy to find and modify code
- **Scalability**: Easy to add new features

---

## 🗄️ PRISMA & DATABASE

### What is Prisma?
- **ORM (Object-Relational Mapping)**: Tool to interact with database using TypeScript
- **Type Safety**: Generates TypeScript types from your schema
- **No Raw SQL**: Write TypeScript, Prisma converts to SQL

### Prisma Schema (`schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"  // Custom output location
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Reads from .env file
}

model Note {
  id        String   @id @default(uuid())
  viewId    String   @unique
  editId    String   @unique
  content   String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt  // Auto-updates on every update!

  @@index([viewId])  // Speeds up lookups
  @@index([editId])
}
```

**Key Schema Attributes:**
- `@id`: Primary key
- `@unique`: Ensures no duplicates
- `@default(now())`: Sets timestamp on creation
- `@updatedAt`: **Automatically updates** on every update (Prisma handles this!)
- `@@index`: Makes lookups faster

### Prisma Client Setup

**File: `config/prisma.ts`**
```typescript
import { PrismaClient } from "../generated/prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// IMPORTANT: Load .env BEFORE creating PrismaClient!
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const prisma = new PrismaClient();  // Single instance (reuse it!)

// Cleanup on exit
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
```

**Why single instance?**
- Prisma manages database connections
- Multiple instances = too many connections
- One instance shared across app

**Why load dotenv first?**
- PrismaClient reads `DATABASE_URL` when created
- Must load `.env` before `new PrismaClient()`

**What is `process.on("beforeExit")`?**
- Listens for when Node.js program is about to exit
- Runs cleanup code (disconnect from database)
- Prevents connection leaks

### Prisma Commands

```bash
# Generate TypeScript types from schema
npx dotenv -e ../../.env -- npx prisma generate

# Create and apply migration (creates database table)
npx dotenv -e ../../.env -- npx prisma migrate dev
# When prompted, enter migration name: "init"

# Open database GUI
npx dotenv -e ../../.env -- npx prisma studio
```

**Why use dotenv-cli?**
- Prisma CLI looks for `.env` in same directory as schema
- Our `.env` is at root
- `dotenv-cli` loads root `.env` before running Prisma

### Prisma Query Methods

```typescript
// CREATE
await prisma.note.create({
  data: { viewId, editId, content }
});

// READ (by unique field)
await prisma.note.findUnique({
  where: { viewId }
});

// UPDATE
await prisma.note.update({
  where: { viewId },
  data: { content: "new content" }
  // updatedAt is automatically updated by Prisma!
});

// DELETE
await prisma.note.delete({
  where: { viewId }
});
```

**Important:**
- `data: { ... }` is required - Prisma's API design
- `prisma.note` - `.note` comes from model name in schema (lowercase)
- Type safety: TypeScript will error if you use wrong fields
- `@updatedAt` field is **automatically** updated - don't set it manually!

### Supabase Setup
- **What**: PostgreSQL database (hosted in cloud)
- **Why**: Easy setup, free tier, connection string provided
- **Connection String**: Get from Settings → Database → Connection string (URI)
- **Use Transaction Pooler**: Port 6543 (works better with IPv4/IPv6)
- **Direct Connection**: Port 5432 (may have IPv4/IPv6 issues)

---

## 🚀 EXPRESS.JS BASICS

### What is Express?
- **Web Framework**: Handles HTTP requests/responses
- **Middleware**: Functions that run on every request
- **Routing**: Maps URLs to functions

### Express App Setup

```typescript
import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware (runs on every request, in order)
app.use(cors());           // Allow cross-origin requests
app.use(express.json());   // Parse JSON request bodies

// Routes
app.use("/api/notes", notesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Middleware Explained

**CORS (Cross-Origin Resource Sharing)**
```typescript
app.use(cors());
```
- **Why**: Frontend (port 3000) needs to call backend (port 4000)
- **What**: Adds headers to allow cross-origin requests
- **Without it**: Browser blocks requests (security feature)

**express.json()**
```typescript
app.use(express.json());
```
- **Why**: Converts JSON request body to JavaScript object
- **What**: Makes `req.body` available in controllers
- **Example**: `{"content": "hello"}` → `req.body = { content: "hello" }`

**Middleware Order Matters!**
- Runs top to bottom
- Then routes are matched

### Request & Response Objects

**Request (`req`):**
- `req.body`: Request body data (from `express.json()`)
- `req.params`: URL parameters (e.g., `:viewId`)
- `req.query`: Query string (e.g., `?page=1`)
- `req.headers`: HTTP headers

**Response (`res`):**
- `res.json()`: Send JSON response
- `res.status()`: Set HTTP status code
- `res.send()`: Send text/HTML
- `res.redirect()`: Redirect to another URL

### HTTP Methods
- `GET`: Read data
- `POST`: Create data
- `PUT`: Update data
- `DELETE`: Delete data

### Route Definition

```typescript
// Simple route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount router
app.use("/api/notes", notesRoutes);
// Routes in notesRoutes become:
// POST /api/notes → notesController.create
// GET /api/notes/:viewId → notesController.getNote
```

### Request Flow Example

```
Client sends: POST http://localhost:4000/api/notes
                    ↓
Express matches: /api/notes
                    ↓
Routes to: notesRoutes
                    ↓
Calls: notesController.create
                    ↓
Controller calls: notesService.create()
                    ↓
Service saves to database
                    ↓
Response sent back: res.json({ ... })
```

---

## 🏛️ BACKEND ARCHITECTURE

### Three-Layer Architecture

**1. Routes (`routes/notes.routes.ts`)**
- **Purpose**: Define API endpoints (URLs)
- **What it does**: Maps URLs to controller functions
```typescript
router.post('/', notesController.create);
router.get('/:viewId', notesController.getNote);
router.put('/:viewId', notesController.update);
```

**2. Controllers (`controllers/notes.controller.ts`)**
- **Purpose**: Handle HTTP requests/responses
- **What it does**:
  - Receives request
  - Validates input
  - Calls service
  - Sends response
```typescript
async create(req: Request, res: Response) {
  const { content } = req.body;  // Extract data
  // Validate
  const note = await notesService.create(content);  // Call service
  res.status(201).json(note);  // Send response
}
```

**3. Services (`services/notes.service.ts`)**
- **Purpose**: Business logic & database operations
- **What it does**:
  - Database queries (Prisma)
  - Business rules
  - Data processing
```typescript
async create(content: string) {
  const viewId = generateViewId();
  const editId = generateEditId();
  return await prisma.note.create({ data: { viewId, editId, content } });
}
```

### Request Flow

```
Client Request
    ↓
Express Middleware (cors, json parser)
    ↓
Route Matches URL
    ↓
Controller Function
    ↓
Service Function
    ↓
Database (Prisma)
    ↓
Service Returns Data
    ↓
Controller Sends Response
    ↓
Client Receives Response
```

### Why Separate Layers?

**Routes**: Just URL mapping - simple and clear
**Controllers**: HTTP handling - validation, error responses
**Services**: Business logic - reusable, testable without HTTP

---

## ❌ COMMON ERRORS & SOLUTIONS

### Error 1: "Environment variable not found: DATABASE_URL"

**Problem**: Prisma Client created before `.env` is loaded

**Solution**: Load dotenv in `prisma.ts` BEFORE creating PrismaClient
```typescript
// ✅ CORRECT ORDER
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
const prisma = new PrismaClient();

// ❌ WRONG - PrismaClient created before .env loaded
const prisma = new PrismaClient();
dotenv.config(...);
```

**Path Calculation:**
- File location: `apps/server/src/config/prisma.ts`
- Go up 4 levels: `../../../../.env` (config → src → server → apps → root)

### Error 2: "Type is any" in Prisma

**Problem**: Import path doesn't match schema output location

**Solution**: Match import to schema output
```typescript
// If schema has: output = "../src/generated/prisma"
import { PrismaClient } from "../generated/prisma/client";

// NOT: import { PrismaClient } from "@prisma/client";
```

**Why this happens:**
- Schema specifies custom output location
- Must import from that location
- Default `@prisma/client` won't have your types

### Error 3: "Can't reach database server"

**Causes:**
- Wrong connection string
- Password not replaced (still has `[YOUR-PASSWORD]`)
- Using direct connection (port 5432) with IPv4/IPv6 issues

**Solution**: Use Transaction Pooler connection string (port 6543)
- Go to Supabase → Settings → Database
- Copy "Connection string" → "URI" tab
- Use the pooler URL (port 6543)

### Error 4: Path calculation wrong for dotenv

**Remember:**
- `prisma.ts` is at: `apps/server/src/config/prisma.ts`
- Path: `../../../../.env` (4 levels up)
- `index.ts` is at: `apps/server/src/index.ts`
- Path: `../../../.env` (3 levels up)

**How to calculate:**
1. Count directories from file to root
2. Each `../` goes up one level
3. `config` → `src` → `server` → `apps` → root = 4 levels

### Error 5: "Cannot find module" errors

**Problem**: Missing `.js` extension in imports (ESM modules)

**Solution**: Always add `.js` extension in imports
```typescript
// ✅ CORRECT
import prisma from "../config/prisma.js";
import { notesService } from "../services/notes.service.js";

// ❌ WRONG
import prisma from "../config/prisma";
```

---

## 💡 KEY CONCEPTS

### Environment Variables (.env)
- **Location**: Root of project
- **Format**: `KEY="value"`
- **Load**: Use `dotenv.config()` before using variables
- **Access**: `process.env.DATABASE_URL`
- **Why root level**: Shared between frontend and backend

### TypeScript in Backend
- **Why**: Type safety, catch errors before runtime
- **Types**: Prisma generates types from schema
- **Import**: Must match Prisma output location
- **Type checking**: Hover over variables to see types

### Async/Await
- **Why**: Database operations take time
- **async**: Function can use `await`
- **await**: Waits for operation to complete
```typescript
async create() {
  const note = await prisma.note.create(...);  // Wait for DB
  return note;  // Then return
}
```

### Error Handling
- **try/catch**: Catch errors
- **HTTP Status Codes**:
  - `200`: Success
  - `201`: Created
  - `400`: Bad Request (validation error)
  - `403`: Forbidden (unauthorized)
  - `404`: Not Found
  - `500`: Internal Server Error

### ID Generation
- **viewId**: 9 chars, public (for URLs)
- **editId**: 32 chars, private (for editing)
- **Collision**: Very low probability, database enforces uniqueness
- **Why two IDs**: Security - only creator can edit

### Security Notes
- **editId**: Never send in GET response (only creator has it)
- **Validation**: Always validate input in controller
- **Authorization**: Check editId before allowing updates
- **CORS**: Only allow frontend to make requests

### Prisma `@updatedAt` Attribute
- **What**: Automatically updates timestamp on every update
- **How**: Prisma handles it - you don't set it manually
- **When**: Every time you call `prisma.note.update()`
- **Why**: Track when record was last modified

### ESM (ES Modules) in Node.js
- **Type**: `"type": "module"` in package.json
- **Imports**: Must use `.js` extension
- **Why**: Modern JavaScript module system
- **Alternative**: CommonJS (older, uses `require()`)

---

## 📡 API ENDPOINTS SUMMARY

### POST /api/notes
**Create a new note**
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/notes`
- **Body**: `{ "content": "note text" }`
- **Response**: `{ id, viewId, editId, content, createdAt, updatedAt }`
- **Status**: 201 Created
- **Error**: 400 if content missing/invalid

### GET /api/notes/:viewId
**Get note by viewId**
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/notes/d3802d329`
- **Params**: `viewId` in URL
- **Response**: `{ id, viewId, content, createdAt, updatedAt }` (no editId!)
- **Status**: 200 OK or 404 Not Found

### PUT /api/notes/:viewId
**Update note**
- **Method**: `PUT`
- **URL**: `http://localhost:4000/api/notes/d3802d329`
- **Params**: `viewId` in URL
- **Body**: `{ "content": "new text", "editId": "token" }`
- **Response**: `{ id, viewId, content, createdAt, updatedAt }`
- **Status**: 200 OK, 400 Bad Request, or 403 Forbidden
- **Security**: Requires valid editId

---

## 🎯 QUICK REFERENCE

### Prisma Queries
```typescript
// Create
prisma.note.create({ data: { viewId, editId, content } })

// Read (by unique field)
prisma.note.findUnique({ where: { viewId } })

// Update
prisma.note.update({ 
  where: { viewId }, 
  data: { content: "new content" } 
})

// Delete
prisma.note.delete({ where: { viewId } })
```

### Express Routes
```typescript
app.get("/path", handler)
app.post("/path", handler)
app.put("/path", handler)
app.delete("/path", handler)
app.use("/prefix", router)  // Mount router
```

### HTTP Status Codes
- `200`: OK
- `201`: Created
- `400`: Bad Request
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

### File Paths (from different locations)
- `prisma.ts`: `../../../../.env` (4 levels up)
- `index.ts`: `../../../.env` (3 levels up)
- `service.ts`: Import from `../config/prisma.js`

### Request/Response
```typescript
// Get data from request
const { content } = req.body;        // From body
const { viewId } = req.params;       // From URL params
const { page } = req.query;          // From query string

// Send response
res.json({ data: "value" });         // JSON response
res.status(201).json({ ... });       // With status code
res.status(404).json({ error: "..." }); // Error response
```

---

## 📝 NOTES TO REMEMBER

1. **Always load dotenv before creating PrismaClient**
2. **Prisma `@updatedAt` automatically updates - don't set manually**
3. **Import PrismaClient from custom output path if specified in schema**
4. **Middleware order matters in Express**
5. **Use Transaction Pooler URL for Supabase (port 6543)**
6. **Never send editId in GET responses (security)**
7. **Always validate input in controllers**
8. **One PrismaClient instance for entire app**
9. **Path calculation: count directory levels from file to root**
10. **TypeScript types come from Prisma - hover to see them**
11. **Add `.js` extension to imports in ESM modules**
12. **`req.params` for URL parameters, `req.body` for request body**
13. **Service layer = database operations, Controller = HTTP handling**
14. **Use try/catch in controllers for error handling**
15. **HTTP status codes communicate result to client**

---

## 🔧 TROUBLESHOOTING CHECKLIST

When something doesn't work:

1. ✅ Is `.env` file in root with `DATABASE_URL`?
2. ✅ Is dotenv loaded before PrismaClient?
3. ✅ Is import path matching Prisma output location?
4. ✅ Are you using Transaction Pooler URL (port 6543)?
5. ✅ Is server running (`npm run dev`)?
6. ✅ Are imports using `.js` extension?
7. ✅ Is middleware order correct (cors, json, then routes)?
8. ✅ Is route path matching URL?
9. ✅ Is controller calling service correctly?
10. ✅ Is service returning data?

---

## 🚦 NEXT STEPS

- [ ] Build frontend (React + TanStack Query)
- [ ] Connect frontend to backend API
- [ ] Add error handling UI
- [ ] Add loading states
- [ ] Implement "Create Copy" functionality
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Test end-to-end flow

---

## 📚 ADDITIONAL RESOURCES

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### Express
- [Express.js Docs](https://expressjs.com/)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

**Created**: Today's Learning Session
**Project**: Notes App - Full Stack
**Status**: Backend Complete ✅
**Next**: Frontend Development

