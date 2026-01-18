# Real-Time Chat Application

A simple real-time chat application using React, Node.js, Express, and Socket.io.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

## How to Run Locally

This project consists of two parts: the **Server** (Backend) and **Client** (Frontend).

### 1. Start the Server
```bash
cd server
npm start
```
Starts on `http://localhost:3001`.

### 2. Start the Client
```bash
cd client
npm run dev
```
Starts on `http://localhost:5173`.

---

## Deployment Configuration

You can deploy this application in two ways:

### Option A: Single Server (Recommended)
You can deploy the **Server** only. It is configured to serve the frontend files automatically.
1. Running `npm run build` in the root folder builds the client.
2. The server serves the build files from `client/dist`.

### Option B: Split Deployment (Best for Performance)

**Step 1: Deploy Backend (Render)**
1.  Create an account on [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Scroll down to configure:
    *   **Root Directory**: `server`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Click **Deploy**.
6.  Once live, copy the URL (e.g., `https://chat-api.onrender.com`).

**Step 2: Deploy Frontend (Vercel)**
1.  Create an account on [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Root Directory**: Click "Edit" and select `client`.
    *   **Framework**: It should auto-detect "Vite".
5.  **Important**: Open the **Environment Variables** section.
    *   Key: `VITE_SERVER_URL`
    *   Value: Paste your Render Backend URL (from Step 1).
6.  Click **Deploy**.

**Result**: You now have a Frontend URL (Vercel) and a Backend URL (Render). Share the Vercel link with friends!

## Features
- **Create Unique Rooms**: Share code to invite friends.
- **File Sharing**: Upload Images, PDFs, and Docs (no storage required).
- **Download**: Dedicated download button for all shared files.
