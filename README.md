# Smart Task Engine

A full-stack task management application built as a senior software engineering assessment.

**Stack:** Python · Flask · SQLite · React · Marshmallow

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Key Technical Decisions](#key-technical-decisions)
5. [Rule Engine](#rule-engine)
6. [AI Usage & Guidance](#ai-usage--guidance)
7. [Running the Project](#running-the-project)
8. [API Reference](#api-reference)
9. [Testing](#testing)
10. [Known Risks & Tradeoffs](#known-risks--tradeoffs)
11. [Extension Approach](#extension-approach)

---

## Project Overview

Smart Task Engine lets users create, view, edit, and track tasks with priorities, statuses, and deadlines. The backend enforces business rules through a decoupled rule engine. The frontend is a React single-page app with a responsive modal-based UI.

**Core features:**
- Create, read, update, delete tasks
- Fields: title, description, priority (LOW/MEDIUM/HIGH), status (TODO/IN_PROGRESS/DONE), deadline, created_at
- Business rules enforced server-side (e.g. HIGH priority requires a deadline; DONE tasks are immutable)
- Popup modal form for add and edit — no page navigation required
- Live stats dashboard (total, to do, in progress, done)
- Responsive for mobile and desktop

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Frontend (SPA)                                   │
│  TaskPage → TaskModal / TaskList → api.js (axios)       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON)
┌──────────────────────▼──────────────────────────────────┐
│  Flask Routes  (task_routes.py)                         │
│  Input validation via marshmallow schema.load()         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  TaskService  (task_service.py)                         │
│  Orchestrates rule checking and persistence             │
└──────────┬───────────────────────────┬──────────────────┘
           │                           │
┌──────────▼──────────┐   ┌────────────▼────────────────┐
│  Rule Engine        │   │  SQLAlchemy ORM             │
│  task_rules.py      │   │  Task model → SQLite        │
└─────────────────────┘   └─────────────────────────────┘
```

**Layered request flow:**

```
Request → Route → Schema.load() → TaskService → Rules → Model → DB
Response ← Route ← Schema.dump() ←────────────────────────────────
```

---

## Project Structure

```
smart-task-engine/
├── backend/
│   ├── app.py                  # App factory, CORS, blueprint registration
│   ├── extensions.py           # SQLAlchemy instance (avoids circular imports)
│   ├── config.py               # Config placeholder (expandable)
│   ├── models/
│   │   └── task.py             # Task SQLAlchemy model
│   ├── routes/
│   │   ├── task_routes.py      # CRUD endpoints — thin, no business logic
│   │   └── ai_routes.py        # AI suggestion stub endpoint
│   ├── schemas/
│   │   └── task_schema.py      # Marshmallow schema — serialization + validation
│   ├── services/
│   │   └── task_service.py     # Business logic — rule application + persistence
│   ├── rules/
│   │   ├── base_rule.py        # BaseRule interface
│   │   └── task_rules.py       # Concrete rules (HIGH priority, immutability, overdue)
│   └── tests/
│       └── test_tasks.py       # Test entry point
│
└── frontend/
    └── src/
        ├── App.js
        ├── index.css               # CSS design system (custom properties)
        ├── pages/
        │   └── TaskPage.js         # Page orchestrator — state, modal, stats
        ├── components/
        │   ├── TaskModal.js        # Add/Edit modal form (reused for both modes)
        │   ├── TaskList.js         # Task cards grid with edit/delete/status cycle
        │   ├── TaskForm.js         # Quick-add inline form (legacy, kept for reference)
        │   ├── Layout.js           # Shell: sidebar + navbar + footer
        │   ├── Sidebar.js          # Collapsible nav sidebar
        │   ├── Navbar.js           # Top bar with task count pill
        │   ├── Footer.js           # Footer with dynamic year
        │   └── Modal.js            # Generic reusable modal shell
        ├── services/
        │   └── api.js              # Axios instance (baseURL config)
        └── styles/
            ├── layout.css          # Layout system (sidebar, navbar, content, footer)
            └── components.css      # Component styles (buttons, forms, cards, badges)
```

---

## Key Technical Decisions

### 1. App Factory pattern (`create_app`)
Flask is initialized through a factory function rather than at module level. This makes the app testable (each test can create a fresh instance) and prevents circular import issues between `extensions.py`, models, and routes.

### 2. `extensions.py` for shared instances
`db = SQLAlchemy()` lives in `extensions.py` and is imported by both app and models. This breaks the circular dependency that would occur if models imported from `app.py`.

### 3. Marshmallow schema as the single validation boundary
`schema.load()` is called in the route layer before any data reaches the service. This means:
- Type coercion happens once (e.g. deadline string → Python `datetime`)
- Invalid enum values are rejected at the boundary
- The service and rules can trust the types they receive

Using `partial=True` on updates avoids requiring all fields on every PUT request.

### 4. Rule engine decoupled from service
Business rules (`HighPriorityDeadlineRule`, `CompletedTaskImmutableRule`, `OverdueRule`) extend `BaseRule` and live in `rules/task_rules.py`. The service iterates `RULES` and collects errors; it has no knowledge of what rules exist. Adding a new rule means adding a class — no changes to service or routes.

### 5. Status cycle on the frontend only
The status progression (TODO → IN_PROGRESS → DONE) is managed client-side as a cycle button. The server treats status as a plain string field; progression directionality is a UI concern.

### 6. Reusable modal form for add and edit
`TaskModal` accepts an optional `task` prop. When `null`, it renders an empty add form; when a task object is provided, it pre-populates all fields. One component handles both flows, eliminating duplication.

### 7. CSS custom properties as a design system
All colors, radii, shadows, and spacing are defined as CSS variables in `index.css`. Component and layout files reference only these variables, making global theme changes a single-file edit.

### 8. SQLite for development simplicity
SQLite requires zero configuration and ships with Python. The database file is created automatically on first run. The connection string lives in `app.py` and can be swapped for PostgreSQL by changing one line (the ORM layer is database-agnostic).

---

## Rule Engine

Rules implement a single interface:

```python
class BaseRule:
    def validate(self, context, is_update=False) -> list[str]:
        return []
```

`context` is a dict containing `data` (the incoming payload) and `existing` (the current Task object for updates). Rules return a list of error strings — empty means pass.

| Rule | When it fires | Effect |
|---|---|---|
| `HighPriorityDeadlineRule` | Create or update with `priority=HIGH` | Blocks if no `deadline` provided |
| `CompletedTaskImmutableRule` | Any update | Blocks if existing task status is `DONE` |
| `OverdueRule` | Create or update with a `deadline` | Sets `status=OVERDUE` if deadline is in the past |

New rules are registered by appending to the `RULES` list in `task_rules.py` — no other file changes required.

---

## AI Usage & Guidance

AI (GitHub Copilot / Claude) was used throughout development for:

- **Scaffolding** — initial project layout, boilerplate Flask factory, React component shells
- **CSS design system** — CSS custom properties structure, responsive layout rules, component styling
- **Debugging** — identifying the `SQLite DateTime` type error caused by passing raw string from `request.json` instead of deserialized Python `datetime`
- **Code review** — catching missing `schema.load()` in routes, suggesting `partial=True` for PUT

**How AI output was critically reviewed:**

All generated code was read line-by-line before committing. Specific issues caught and corrected:
- `OverdueRule` called `datetime.fromisoformat(task['deadline'])` on what is already a `datetime` object after `schema.load()` — the rule was kept but flagged for fix (see Known Risks)
- `HighPriorityDeadlineRule` received the full `context` dict but indexed it as if it were the raw data dict — the rule signature inconsistency was identified
- AI-suggested modal CSS used `position: absolute` which broke scroll on small screens; changed to `position: fixed` with `max-height: calc(100vh - 32px)`

**AI guidance constraints applied:**
- No business logic in routes — routes only deserialize input and delegate
- Always validate at the boundary — `schema.load()` before service calls
- Modular rule design — each rule is a self-contained class
- Avoid duplication — `TaskModal` reused for add and edit instead of two separate forms
- Generated code reviewed and tested before accepting

---

## Running the Project

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-sqlalchemy flask-cors marshmallow

# Start the API server
python app.py
# Runs on http://127.0.0.1:5000
```

The SQLite database (`instance/tasks.db`) is created automatically on first run.

### Frontend

```bash
cd frontend

npm install
npm start
# Runs on http://localhost:3000
```

The frontend proxies API calls to `http://127.0.0.1:5000`.

---

## API Reference

### `GET /tasks/`
Returns all tasks.

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Design login page",
    "description": "Wireframe and implement",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "deadline": "2026-04-20T17:00:00",
    "created_at": "2026-04-09T10:00:00"
  }
]
```

---

### `POST /tasks/`
Create a new task. `title` is required. `priority=HIGH` requires `deadline`.

**Request:**
```json
{
  "title": "Write unit tests",
  "description": "Cover all service methods",
  "priority": "HIGH",
  "status": "TODO",
  "deadline": "2026-04-15T12:00"
}
```

**Response 201:** Created task object  
**Response 400:** `{ "errors": ["Deadline is required for high priority tasks"] }`

---

### `PUT /tasks/<id>`
Update any subset of fields. DONE tasks cannot be updated.

**Request (partial):**
```json
{ "status": "DONE" }
```

**Response 200:** Updated task object  
**Response 400:** `{ "errors": ["Completed tasks cannot be updated"] }`

---

### `DELETE /tasks/<id>`
Delete a task.

**Response 204:** No content

---

### `POST /ai/suggest`
Returns a title suggestion (stub — not connected to an LLM).

**Request:** `{ "title": "fix bug" }`  
**Response:** `{ "suggested_title": "Fix bug", "suggestion": "Consider adding a deadline or priority" }`

---

## Testing

```bash
cd backend
python -m pytest tests/
```

Current test coverage is minimal (`test_dummy`). The structure is in place for expansion.

**Priority test cases to add:**
- `HighPriorityDeadlineRule` — HIGH priority without deadline returns error
- `CompletedTaskImmutableRule` — PUT on DONE task returns 400
- `OverdueRule` — past deadline sets status to OVERDUE
- Schema validation — invalid priority/status enum rejected
- Route integration — full request/response cycle for create and update

---

## Known Risks & Tradeoffs

| Risk | Impact | Mitigation / Note |
|---|---|---|
| **Rule context inconsistency** | `HighPriorityDeadlineRule` and `OverdueRule` index `context` as a flat dict but service passes `{"data": ..., "existing": ...}` — rules need to access `context["data"]` | Low risk today (rules still function for create), but will silently skip checks on update. Fix: standardize all rules to use `context["data"].get(...)` |
| **`OverdueRule` type error** | After `schema.load()`, `deadline` is a `datetime` object, but `OverdueRule` calls `datetime.fromisoformat(task['deadline'])` on it | Will raise `TypeError` on create/update if deadline is provided. Fix: compare the `datetime` directly without re-parsing |
| **SQLite concurrency** | SQLite does not handle concurrent writes well | Acceptable for a single-user demo; swap connection string to PostgreSQL for production |
| **No authentication** | Any user can read, create, update, or delete any task | Noted as a future requirement — see Extension Approach |
| **`status=OVERDUE` not in schema enum** | `OverdueRule` sets `status='OVERDUE'` but the schema only permits `TODO/IN_PROGRESS/DONE` | Overdue status will fail schema validation on dump if implemented. Fix: add OVERDUE to the enum or express overdue as a derived computed property |
| **Minimal test coverage** | Only a placeholder test exists | Tests for the rule engine and key API paths are the immediate next priority |

---

## Extension Approach

**Authentication**
Add Flask-JWT-Extended. Protect all `/tasks/` routes with a `@jwt_required()` decorator. Add a `user_id` foreign key to the Task model and filter queries by the authenticated user. No changes required to the rule engine or service layer.

**Pagination**
Replace `Task.query.all()` with `Task.query.paginate(page, per_page)`. Return `{ items, total, page, pages }` envelope. Frontend: add a page selector or infinite-scroll trigger in `TaskList`.

**Additional Rules**
Create a new class in `task_rules.py` extending `BaseRule`, implement `validate()`, and append an instance to `RULES`. No changes to routes, service, or existing rules.

**PostgreSQL**
Change `SQLALCHEMY_DATABASE_URI` in `app.py` (or externalize to an environment variable). No code changes required elsewhere.

**Real AI Suggestions**
Replace the stub in `ai_routes.py` with a call to an LLM API (OpenAI, Anthropic). Pass the task title and return priority/deadline suggestions. Validate and sanitize LLM output through the existing schema before presenting to the user.

**Observability**
Add structured logging (`logging` module or `structlog`) in the service layer. Log rule violations, creation, and update events with task ID and timestamp. In production, ship logs to a centralized system (Datadog, CloudWatch).
