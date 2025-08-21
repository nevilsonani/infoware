# Mini OMS API (Node.js + Express + Prisma + PostgreSQL)

## Architecture
- Express REST API with modular routes/controllers/services
- Prisma ORM with PostgreSQL; normalized schema for Users, Products, Orders, Units, Inventory
- JWT auth with role-based middleware for BUYER, SUPPLIER, ADMIN
- Order status history and inventory cascade on approvals
- Socket.IO broadcast of order status updates

## Setup
Requirements: Node.js 18+, Docker Desktop (optional) or local PostgreSQL

Environment variables (`.env`):
```
PORT=4000
JWT_SECRET=changeme
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oms?schema=public
```

### Using Docker (recommended for Postgres)
```
docker compose up -d db
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Without Docker (local Postgres)
1) Ensure `DATABASE_URL` points to your local Postgres database
```
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## API (v1)
- Auth: `POST /api/v1/auth/login` { email, password }
- Products:
  - `GET /api/v1/products`
  - `POST /api/v1/products` (SUPPLIER)
  - `PATCH /api/v1/products/:id/stock` (SUPPLIER)
- Orders:
  - `POST /api/v1/orders` (BUYER) body: { items: [{ productId, unitCode, quantity }] }
  - `GET /api/v1/orders` (BUYER)
  - `GET /api/v1/orders/supplier` (SUPPLIER)
  - `PATCH /api/v1/orders/:id/status` (SUPPLIER/ADMIN)
- Admin:
  - `PATCH /api/v1/admin/orders/:id/status` (ADMIN)
  - `GET /api/v1/admin/analytics` (ADMIN)

WebSocket: `order_status` events via Socket.IO

## Demo credentials
- Admin: `admin@example.com` / `password`
- Supplier: `supplier@example.com` / `password`
- Buyer: `buyer@example.com` / `password`

## Notes
- Units include base and convertible units (e.g., KG↔GM). Quantities convert into product base units.
- Inventory decrements when an order moves PENDING → APPROVED.
- Status transitions recorded in `OrderStatusHistory`.


