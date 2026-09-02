# ISKCON Temple Website — FR-005, FR-003, FR-009

Code for:
- **FR-005** Donations (Razorpay)
- **FR-003** Services Management (CRUD)
- **FR-009** Contact & Inquiry

## MongoDB Atlas setup

No code changes are needed to use Atlas instead of local MongoDB — Mongoose connects to both the same way via `mongoose.connect(process.env.MONGO_URI)`. Only the connection string in `.env` changes.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → sign up/log in → **Create a free cluster** (M0 tier).
2. **Database Access** (left sidebar) → **Add New Database User** → set a username/password (save these — you'll need them below).
3. **Network Access** → **Add IP Address**:
   - For local development, click **Add Current IP Address**.
   - If your team is on different networks/deploying to a server, use `0.0.0.0/0` (allow from anywhere) — fine for development, but lock this down for production.
4. Go to your cluster → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Paste it into `backend/.env` as `MONGO_URI`, replace `<username>`/`<password>` with your real credentials, and add your database name before the `?`, e.g.:
   ```
   MONGO_URI=mongodb+srv://iskconAdmin:yourPassword@cluster0.xxxxx.mongodb.net/iskcon_temple?retryWrites=true&w=majority
   ```
6. **If your password has special characters** (`@ # % / : ?` etc.), URL-encode them (e.g. `@` → `%40`) or the connection will fail.

## Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI (Atlas string above), RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
npm run dev
```

You should see `MongoDB connected` in the terminal if the Atlas string is correct.

Get Razorpay test keys from the Razorpay Dashboard → Settings → API Keys (use Test Mode while developing).

## Frontend setup (plain HTML/CSS/JS)

No build step needed — just open the files or serve them statically:

```bash
cd frontend
# Option A: just open index.html directly in a browser
# Option B: serve it properly (recommended, avoids fetch/CORS quirks)
npx serve .
# or
python3 -m http.server 5500
```

Then visit `index.html` / `donate.html` / `services.html` / `contact.html`.

Structure:
```
frontend/
  index.html
  donate.html
  services.html
  contact.html
  assets/
    css/style.css      # temple color/font tokens + all component styles
    js/config.js        # API_BASE URL — change if backend isn't on localhost:5000
    js/donate.js         # category + amount selection, Razorpay checkout flow
    js/services.js       # fetch + render services, admin CRUD
    js/contact.js         # inquiry form submission
```

If your backend runs somewhere other than `http://localhost:5000`, edit `assets/js/config.js`.

## Auth integration (important)

`backend/middleware/authMiddleware.js` is a **placeholder** — it lets every admin route through so you can test end-to-end before your teammate's auth is ready. Once they hand off the real `protect`/`isAdmin` middleware:

1. Delete the placeholder file.
2. Point the `require("../middleware/authMiddleware")` imports in `donationRoutes.js`, `serviceRoutes.js`, `inquiryRoutes.js` to theirs.
3. On the frontend, `services.html` currently reveals admin controls (add/edit/delete) when visited as `services.html?admin=1` — this is just a placeholder for testing. Replace `isAdminUser()` in `assets/js/services.js` with a real check (e.g. reading a login token/cookie set by your teammate's auth system) once it's ready.

## Razorpay flow (FR-005)

1. Frontend calls `POST /api/donations/create-order` → backend creates a Razorpay order + a `Donation` doc (`status: created`) → returns `orderId`.
2. Frontend opens Razorpay Checkout with that `orderId`.
3. On success, Razorpay's `handler` callback fires with `razorpay_payment_id` and `razorpay_signature`.
4. Frontend calls `POST /api/donations/verify` → backend recomputes the HMAC signature server-side and only then marks the donation `paid`. **Never trust a "success" purely from the frontend.**
5. If the user closes the checkout modal, no verify call happens — the donation stays `created` (safe default, no double-charging).

## Testing Razorpay

Use Razorpay's test card `4111 1111 1111 1111`, any future expiry, any CVV, to simulate a successful payment in test mode.

## What's left for your team

- Wire up the admin dashboard UI that consumes `GET /api/donations`, `GET /api/inquiries`.
- Nodemailer notification on new inquiries (a commented-out call is left in `inquiryController.js` to hook in later).
- Replace placeholder temple address/phone/map link in `Contact.jsx` with real details.
