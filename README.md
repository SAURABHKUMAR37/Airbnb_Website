# Airbnb Clone — MERN (backend + frontend + admin)

Your EJS Airbnb app, rebuilt as a pure MERN project with the **same structure and conventions as your ecommerce project**: three separate apps, JSON API, `token` header auth, Cloudinary uploads, Razorpay payments, and an admin panel.

```
airbnb-mern/
├── backend/    Express 5 + MongoDB (Mongoose) REST API          -> http://localhost:4000
├── frontend/   React 19 + Vite + Tailwind (guests & hosts)      -> http://localhost:5173
└── admin/      React 19 + Vite + Tailwind (admin panel)         -> http://localhost:5174
```
No EJS anywhere — the backend only returns JSON.

## Run it

```bash
npm run install:all          # installs root + backend + frontend + admin

# 1) environment files (variable names are the same as in your ecommerce project)
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example    admin/.env
# open them and fill in the values (see below)

npm run dev                  # starts api + web + admin together
```
Or start each one yourself: `npm run server` in `backend/`, `npm run dev` in `frontend/` and `admin/`.

Create a user from the Sign Up page. 
## Environment variables

**backend/.env** — copy these straight from your ecommerce `backend/.env`, the names are identical:

| Variable | Notes |
|---|---|
| `MONGODB_URL` | e.g. `mongodb://localhost:27017` (no db name — it's set by `DB_NAME`, default `AIRBNB`) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | tokens now expire (default 7d) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | admin panel login |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` | home photo uploads |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | booking payments |
| `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` | forgot-password mail (Gmail App Password). If blank, the reset link is printed in the API console |
| `FRONTEND_URL`, `ADMIN_URL` | CORS allow-list + link in reset emails |

**frontend/.env**: `VITE_BACKEND_URL`, `VITE_RAZORPAY_KEY_ID` (same as ecommerce). **admin/.env**: `VITE_BACKEND_URL`.

> Your ecommerce `.env` files (Razorpay secret, Cloudinary secret, admin password, JWT secret) were inside the zip you uploaded. If that zip was shared or pushed anywhere, rotate those keys. `.env` is git-ignored in all three apps here.

## Features

**Everything from the EJS app is kept:**
signup / login / logout · forgot & reset password by email · browse + search (name, location, price range) + sort (rating / price) · home details with photo gallery · reviews with 1–5 rating and auto-calculated home rating (one review per user) · favourites · availability calendar · date-range booking with overlap prevention · my bookings + cancel · host dashboard (my homes + their bookings + revenue) · add / edit / delete own homes (ownership enforced server-side).

**Added from your ecommerce project / new:**
- **Cloudinary** photo upload (multi-image, previews, remove/keep existing on edit) instead of pasting URLs
- **Razorpay** payment for bookings, with **pay-at-property** as the COD equivalent
- **Admin panel**: dashboard stats, add/edit/delete any home, all bookings (status, payment, **Razorpay refund button**), users (delete with cascade), reviews moderation
- Search page pagination, shareable filter URLs, delete-own-review

### How payments work
1. Guest picks dates → `POST /api/booking`. The **server** computes nights × price (the client's price is ignored) and checks availability.
2. Pay online: the dates are held for 15 minutes, a Razorpay order is created and the checkout opens. On success the frontend calls `/api/booking/verify`; the server checks Razorpay's **HMAC signature** before confirming. Closing the checkout releases the dates immediately.
3. If a payment lands after the hold expired *and* someone else took the dates, the booking is not double-booked: it is cancelled and flagged **refund pending**.
4. Cancelling a paid booking flags it **refund pending**; the admin clicks *Issue refund* (Razorpay refund API).

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/user/register · login · admin · forgot-password`, `GET /api/user/me`, `GET/POST /api/user/reset-password/:token` |
| Homes (public) | `GET /api/home?title&location&minPrice&maxPrice&sort&page&limit`, `GET /api/home/:id`, `GET /api/home/:id/booked-dates` |
| Reviews | `GET/POST /api/review/home/:homeId`, `DELETE /api/review/:reviewId` |
| Favourites | `GET /api/favourite`, `POST/DELETE /api/favourite/:homeId` |
| Host | `GET/POST /api/host/homes`, `GET/PUT/DELETE /api/host/homes/:id` (multipart for POST/PUT) |
| Bookings | `POST /api/booking`, `POST /api/booking/verify`, `GET /api/booking/mine`, `POST /api/booking/:id/cancel` |
| Admin | `/api/admin/stats · homes · bookings (+status, refund) · users · reviews` |

Auth is the `token` header (same as the ecommerce project). Responses are `{ success, ... }` with proper HTTP status codes.

## Differences from the ecommerce backend (on purpose)
- Admin JWT carries `{role:'admin', email}` — not `email+password` — and credentials are compared in constant time.
- Order/booking price is computed server-side; payment is verified by signature; money-related edge cases are handled (see above).
- Uploads go from memory straight to Cloudinary (no files written to disk, 5 MB / image-type limits).
- The server only starts listening after MongoDB connects; global error handler; Helmet, CORS allow-list, rate limits (stricter on auth), Mongo-operator sanitising.

## Docker
`docker compose up --build` starts MongoDB + the API (reads `backend/.env`). Build the two React apps with `npm run build` and host the `dist/` folders on any static host (set `FRONTEND_URL` / `ADMIN_URL` to those addresses).
