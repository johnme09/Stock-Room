# Stock Room Backend & Integration Guide (Beginner Friendly)

This guide explains how to set up the database, what the backend now saves, how to exercise every feature from the React UI, and why certain files (like `.env`) matter. Follow the sections in order—even if you’ve never used a database before, you’ll be able to launch the project.

---

## 1. What changed (summary table)

| Area | New functionality | What gets stored |
|------|-------------------|------------------|
| Authentication | Register/Login endpoints with secure password hashing (bcrypt) and JWT sessions. | Users: `username`, `email`, `passwordHash`, `about`, `favorites`, timestamps. |
| Communities | Owners can create/edit/delete communities; all users can search and favorite them. | Communities: `title`, `description`, `image`, `ownerId`, timestamps. |
| Items | Owners add items to their communities. | Items: `title`, `description`, `image`, `communityId`, `createdBy`, timestamps. |
| Personal tracking | Each user marks every item as `have`, `want`, or `dont_have`. | UserItems: `userId`, `itemId`, `communityId`, `status`. |

The React frontend now calls the Node/Express API for everything (login, creating communities/items, marking items, updating profile text). All data persists in MongoDB.

---

## 2. Install prerequisites

| Tool | Purpose | Download |
|------|---------|----------|
| **Node.js 18+** (npm included) | Runs backend (Express) + frontend (Vite). | https://nodejs.org/en/download |
| **MongoDB** | Database. You can run it locally (recommended for offline dev) or via MongoDB Atlas (free cloud). | See Section 3. |

Verification:
```bash
node -v
npm -v
```

---

## 3. Set up MongoDB (choose ONE path)

### Option A – Local MongoDB Community Server
1. Download the **Community Server** installer: https://www.mongodb.com/try/download/community  
   - Choose the latest version, MSI installer (Windows) or appropriate package for your OS.
2. Run the installer. Keep defaults (ensure “MongoDB Server” is selected).
3. Create a folder for data, e.g. `C:\data\db`.
4. Start MongoDB in a terminal:
   ```bash
   mongod --dbpath="C:\data\db"
   ```
5. Leave that terminal open. MongoDB now listens at `mongodb://127.0.0.1:27017`.

### Option B – MongoDB Atlas (cloud-hosted)
1. Go to https://www.mongodb.com/atlas/database → “Try Free”.
2. Create an account, then start a **Free Shared Cluster (M0)**.
3. During setup:
   - **Database Access** → “Add New Database User” → choose username + password (save them).
   - **Network Access** → “Add IP Address” → either your IP or “Allow access from anywhere (0.0.0.0/0)” for development.
4. Click “Connect” → “Connect your application” → copy the connection string. It looks like:
   ```
   mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.xxxxx.mongodb.net/stock-room?retryWrites=true&w=majority
   ```
   Replace `<USERNAME>`/`<PASSWORD>` with the credentials from step 3.

---

## 4. Configure environment variables (`.env`)

We store secrets (database URLs, JWT keys) in `.env` files. They are ignored by Git (`.gitignore`) so private information never hits your repository.

### Backend (`backend/.env`)
1. From repo root:
   ```bash
   cd backend
   copy env.example .env          # mac/linux: cp env.example .env
   ```
2. Edit `backend/.env`:
   ```
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/stock-room   # if using local Mongo
   # OR paste your Atlas connection string here

   JWT_SECRET=replace-with-a-long-random-string
   CLIENT_ORIGIN=http://localhost:5173
   ```
   - Use a long random `JWT_SECRET` (e.g., generated via https://www.lastpass.com/password-generator).

### Frontend (`frontend/.env`)
1. From repo root:
   ```bash
   cd frontend
   copy env.example .env
   ```
2. Normally the default `VITE_API_URL=http://localhost:4000/api` is correct. Edit only if you change backend port.

> **Why copy `env.example`?** It documents which variables you must set. Everyone works off their own `.env`. Because `.env` is ignored by Git, secrets stay on your machine.

---

## 5. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 6. Start the project

1. **Start MongoDB**
   - Local option: ensure the `mongod --dbpath ...` terminal remains running.
   - Atlas: nothing to start; cluster is hosted.

2. **Backend server** (new terminal):
   ```bash
   cd backend
   npm run dev
   ```
   Expected: `API server ready on port 4000`.  
   If you see “Missing MongoDB connection string” or `ECONNREFUSED`, revisit Sections 3–4.

3. **Frontend** (another terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   Vite prints a URL (typically `http://localhost:5173`). Open it in your browser.

---

## 7. Test every feature from the website

Follow these steps to confirm the database-backed flow works end-to-end.

### 7.1 Sign up and log in
1. Visit `http://localhost:5173/signup`.
2. Enter username, email, password (≥8 chars), confirm password → submit.
3. Use the header menu (☰) → “Log out”.
4. Go to `http://localhost:5173/login`, enter the same credentials, and log in.
5. Header now reads “Hi, <username>” — confirms auth & JWT storage.

### 7.2 Create a community
1. On Home, click “Create your own community”.
2. Fill Title + optional description/image and click “Create”.
3. The community appears under “Favorited Communities”. It’s stored in MongoDB and tied to your user.

### 7.3 Search communities
1. Use the Home search bar. Enter part of the community name and press Search.
2. Matching results load beneath. This is the `/api/communities?q=...` endpoint.

### 7.4 Add items (owner-only)
1. Click “View Community” for a community you own.
2. You’ll see the “Add New Item” form (only owners can see it).
3. Add items with titles/descriptions/images. They appear instantly in the list and persist in MongoDB.

### 7.5 Track your personal collection
1. On the community page, change the dropdown from “Community View” to “Personal View”.
2. The page switches to `/collection/personal?communityId=...`.
3. For each item, choose Want / Have / Don’t Have. These updates call `/api/user-items`.
4. Refresh the page; selections remain because they’re saved for your user.

### 7.6 Manage favorites
1. Click the star/“Favorite” button on a community.
2. Go to `/profile`; it appears under “Your Favorite Communities”.
3. Click favorite again to remove it; profile list updates immediately.

### 7.7 Update profile info
1. Navigate to `/settings`.
2. Change the “About me” text and click Save. The backend patches `/api/users/me`.
3. Open `/profile` to confirm the new bio.

If any step fails, look at the backend terminal—error messages (validation/auth) are printed there to guide you.

---

## 8. Optional: API tests via curl/Postman

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ash","email":"ash@example.com","password":"password123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ash@example.com","password":"password123"}' | jq -r '.token')

# Create a community
curl -X POST http://localhost:4000/api/communities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pokemon Cards","description":"Rare pulls"}'
```

---

## 9. Important notes about `.env`

- `.env` holds secrets (database credentials, JWT key). It must never be committed to GitHub, which is why it’s listed in `.gitignore`.
- `env.example` is safe to commit—it shows the required variable names without secrets. Each teammate copies it to `.env` and fills in their own values.
- When deploying, you configure the same variables on the hosting provider instead of committing them.

---

## 10. Troubleshooting cheatsheet

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Failed to start server: Missing MongoDB connection string` | `MONGODB_URI` not set in `backend/.env`. | Edit `.env`, set the URI, restart `npm run dev`. |
| `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB isn’t running. | Start `mongod --dbpath ...` as described in Section 3 Option A. |
| Browser shows a CORS error | `CLIENT_ORIGIN` in backend `.env` doesn’t match the frontend URL. | Update `.env` then restart backend. |
| Login fails even with correct password | Email already exists (unique constraint). | Use a new email or remove the duplicate user directly from MongoDB. |
| Node warning about CommonJS vs ES modules | Add `"type": "module"` inside `backend/package.json`. |

---

## 11. Future enhancements

- Add pagination/filtering to community and item lists.
- Implement full forum threads for each community.
- Allow owners to invite moderators and share item creation rights.

Once MongoDB is running and `.env` is configured, your daily workflow is:
1. `npm run dev` inside `backend/`
2. `npm run dev` inside `frontend/`
3. Open `http://localhost:5173`