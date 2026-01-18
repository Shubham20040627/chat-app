# Deployment Guide

Since we have configured the app to be a single deployment (Backend serving Frontend), you can use almost any cloud provider that supports Node.js.

Current Scripts Configuration:
- **Build Command:** `npm run build` (Installs dependencies and builds the React client)
- **Start Command:** `npm start` (Starts the Node.js server)

Here are the step-by-step guides for **Railway** and **Heroku**.

---

## Option 1: Railway (Recommended)
Railway is very similar to Render and often faster to set up.

1.  **Push your code to GitHub** (if you haven't already).
2.  **Sign up/Login** at [railway.app](https://railway.app/).
3.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
4.  Select your repository (`chat-app`).
5.  Railway will automatically detect it's a Node.js app.
6.  Go to **Settings** -> **Build & Deploy**.
    *   **Build Command:** `npm run build`
    *   **Start Command:** `npm start`
7.  Railway usually auto-detects these, but double-check.
8.  It will deploy automatically. Once done, you will get a public URL.

---

## Option 2: Heroku
Heroku is a classic platform. Note that their free tier is no longer available, so this would be a paid option (~$5/mo).

1.  **Install the Heroku CLI** and login (`heroku login`).
2.  Navigate to your project folder in the terminal.
3.  **Create a Heroku app**:
    ```bash
    heroku create
    ```
4.  **Verify configuration**:
    Heroku expects the `start` script in `package.json`, which we added.
    It also defaults to running `npm install` and `npm run build` if a `build` script is present (which it is).
5.  **Deploy**:
    ```bash
    git push heroku main
    ```
    *(Or `git push heroku master` depending on your branch name)*.
6.  **Open the app**:
    ```bash
    heroku open
    ```

---

## Troubleshooting
- **Port:** The app is set to listen on `process.env.PORT`. Both Railway and Heroku provide this automatically. If you deploy to a generic VPS (like DigitalOcean Droplet), make sure to expose the port or set `PORT=80`.
- **Socket Connection:** The client tries to connect to the relative path (same origin). This works perfectly on these platforms because the server is serving the client.
