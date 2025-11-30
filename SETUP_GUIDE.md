# Team Setup Guide - Stock Room

This guide explains how to get the Stock Room application running with access to the shared MongoDB Atlas database.

## Prerequisites

- Node.js (v14 or higher)
- npm
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/johnme09/Stock-Room.git
cd Stock-Room
```

### 2. Backend Setup

#### a. Install Dependencies

```bash
cd backend
npm install
```

#### b. Configure Environment Variables

- Copy the `env.example` file to `.env`:
  ```bash
  cp env.example .env
  ```
- Ask a team lead for the MongoDB Atlas connection string
- Update the `.env` file with:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/stock-room?retryWrites=true&w=majority
  PORT=4000
  JWT_SECRET=your-shared-jwt-secret
  CLIENT_ORIGIN=http://localhost:5173
  ```

#### c. Start the Backend Server

```bash
npm run dev
```

You should see: `API server ready on port 4000`

### 3. Frontend Setup

#### a. Open a New Terminal and Navigate to Frontend

```bash
cd frontend
```

#### b. Install Dependencies

```bash
npm install
```

#### c. Configure Environment Variables

- Copy the `env.example` file to `.env`:
  ```bash
  cp env.example .env
  ```
- Ensure the API endpoint points to your local backend:
  ```
  VITE_API_URL=http://localhost:4000
  ```

#### d. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Access

- All team members connect to the **same MongoDB Atlas database**
- Any changes made by one person are visible to all team members
- The database is shared across all development sessions
- Do not push `.env` files to GitHub (they are already in `.gitignore`)

## Troubleshooting

### Backend Won't Start
- Verify MongoDB Atlas connection string is correct in `.env`
- Check that your IP address is whitelisted in MongoDB Atlas
- Ensure port 4000 is not in use

### Frontend Won't Start
- Clear `node_modules` and reinstall: `rm -r node_modules && npm install`
- Check that the backend is running on port 4000
- Verify `VITE_API_URL` in `.env` is correct

### Cannot Connect to Database
- Confirm you have the correct MongoDB Atlas credentials
- Check your IP is whitelisted in MongoDB Atlas security settings
- Verify your internet connection

## Important Notes

**Security:**
- Never commit `.env` files to GitHub
- Keep MongoDB Atlas credentials private
- Do not share credentials in chat or email
- Use IP whitelisting in MongoDB Atlas for added security

**Data:**
- All team members share the same database
- Test data created by anyone is visible to everyone
- Be careful not to delete or modify other team members' test data
