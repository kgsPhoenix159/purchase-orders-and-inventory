# SimpleGrid - Purchase Orders & Inventory

A small full-stack ERP app: raise Purchase Orders to vendors, approve them, receive goods, and track inventory. Built for the SimpleGrid.

---

## Quick Start

```bash
# 1. Backend
cd backend
npm install
npm start          # → http://localhost:5174

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev        # → http://localhost:5173  (proxies /api → :5174)
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Tests

```bash
cd backend
npm test           # 22 integration tests (Jest + Supertest)
```

Tests cover: PO creation validation, state transitions, double-receive guard, manager-approval threshold, full lifecycle with stock verification.

---

## Architecture

```
backend/
  src/
    data/seed.js          ← hardcoded products & vendors
    errors/AppError.js    ← custom error with HTTP status
    middleware/            ← central error handler
    models/               ← in-memory stores + business rules
      Product.js           (stock mutations)
      Vendor.js            (read-only lookup)
      PurchaseOrder.js     (state machine, validation, computed totals)
    routes/               ← thin controllers (no logic)
  tests/                  ← integration tests

frontend/
  src/
    api/client.js         ← fetch wrapper with error parsing
    components/           ← reusable UI pieces
    pages/                ← Inventory + PurchaseOrders
```

### Key Design Decisions

1. **Business rules live in the model layer, not routes.**  
   `PurchaseOrder.js` owns the state machine (draft → approved → received), computed totals, validation, and the idempotent receive guard. Routes are thin pass-throughs. This means the same rules apply whether called via API or tests.

2. **Computed totals are never stored.**  
   `total` is always derived from `lineItems.reduce(...)`. The client never sends it; the server always calculates it. This avoids sync issues between stored and actual totals.

3. **Idempotent receive via status guard.**  
   Once a PO is `received`, calling `/receive` again returns `409 Conflict`. Since `receive()` first checks the status before mutating stock, there's no risk of double-applying — the state transition itself is the guard.

4. **Custom error class → structured JSON responses.**  
   `AppError(status, message)` is thrown anywhere in the model/route layer and caught by a single `errorHandler` middleware. The frontend parses `error.message` from the response and shows it as a toast — the API never fails silently.

5. **No global state on the frontend.**  
   Each page fetches its own data. After mutations (create/approve/receive), the relevant list is refetched. This is simple and correct for a small app — no stale cache issues.

6. **Manager approval threshold (bonus).**  
   POs over $5,000 require `?role=manager` on the approve call. Without it → 403 Forbidden. The frontend detects high-value POs and shows a confirmation dialog before sending the manager flag.

### Trade-offs

- **In-memory only** — a server restart wipes all data. Fine for this task; in production you'd add a database.
- **No auth** — the `?role=manager` flag is a simple simulation. In production you'd use proper JWT/session-based auth.
- **No pagination** — fine for a handful of POs; would need pagination for hundreds.
- **Sequential PO IDs** — `PO-001`, `PO-002`, etc. In production, use UUIDs to avoid collisions in distributed systems.
- **No optimistic UI** — the frontend waits for the server response before updating. This is simpler and avoids showing inconsistent state.

---

## API Reference

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/products` | List products with current stock |
| `GET` | `/api/vendors` | List vendors |
| `GET` | `/api/purchase-orders` | List all POs |
| `POST` | `/api/purchase-orders` | Create PO (body: `{ vendorId, lineItems }`) |
| `GET` | `/api/purchase-orders/:id` | Single PO detail |
| `POST` | `/api/purchase-orders/:id/approve` | Draft → Approved (`?role=manager` for > $5K) |
| `POST` | `/api/purchase-orders/:id/receive` | Approved → Received (increases stock) |

### Error responses

```json
{
  "error": {
    "status": 409,
    "message": "Cannot approve a PO that is in 'received' status."
  }
}
```

---

## AI Usage Notes

This project was built with AI assistance (Claude). Here's where AI helped and where I made corrections:

**Where AI helped well:**
- Scaffolding the project structure and boilerplate (Express setup, Vite config, route wiring)
- Generating comprehensive test cases — the 22 tests covering edge cases came from AI and were correct
- Tailwind CSS styling — the dark theme, status badges, and animations were generated accurately
- The `AppError` / error-handler pattern — clean and correct on first pass

**Where I guided or corrected the AI:**
- **Data model design**: I specified that totals should be computed, not stored. AI's first instinct was to store them.
- **Tailwind v4 compatibility**: AI initially set up Tailwind v3 config (`tailwind.config.js` + PostCSS). I corrected to v4's `@tailwindcss/vite` plugin approach.
- **Idempotent receive logic**: I ensured the receive handler checks status *before* mutating stock, not after. The status itself is the idempotency guard.
- **Manager approval UX**: The confirm dialog for high-value POs was my design decision — AI initially tried a separate "role selector" dropdown.
- **Error message quality**: I rewrote several error messages to be more specific and actionable (e.g. "Only 'draft' POs can be approved" instead of generic "Invalid status").
