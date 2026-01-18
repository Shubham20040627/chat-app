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

### Option B: Split Deployment (Frontend & Backend separate)
If you want to host the Client on **Vercel/Netlify** and Server on **Render**:

1. **Backend**: Deploy the `server` folder normally. Note down the provided URL (e.g., `https://my-chat-api.onrender.com`).
2. **Frontend**: Deploy the `client` folder.
3. **Important**: In your Frontend hosting settings (Environment Variables), add:
   - `VITE_SERVER_URL`: `https://my-chat-api.onrender.com`

## Features
- **Create Unique Rooms**: Share code to invite friends.
- **File Sharing**: Upload Images, PDFs, and Docs (no storage required).
- **Download**: Dedicated download button for all shared files.
