# How to Deploy to Render (100% Free)

**Render** is the best place to host your chat app for free.

## Step 1: Sign Up
1.  Go to **[dashboard.render.com/register](https://dashboard.render.com/register)**.
2.  Click **"Sign up with GitHub"**.
3.  Authorize Render to access your GitHub account.

## Step 2: Create a Web Service
1.  On the dashboard, click the **"New +"** button (top right).
2.  Select **"Web Service"**.
3.  You will see a list of your repositories. Find **`chat-app`** and click **"Connect"**.

## Step 3: Configure Settings
Render will ask for some details. Fill them in exactly like this:

*   **Name:** `my-chat-app` (or whatever you want)
*   **Region:** Choose the one closest to you (e.g., Singapore, Oregon, Frankfurt).
*   **Branch:** `main`
*   **Root Directory:** (Leave blank)
*   **Runtime:** **Node**
*   **Build Command:** `npm run build`
*   **Start Command:** `npm start`
*   **Instance Type:** Select **"Free"** (It might say "0.1 CPU, 512MB RAM").

## Step 4: Deploy
1.  Click **"Create Web Service"**.
2.  You will see a terminal window showing logs.
3.  Wait for it to say **"Your service is live"**. This usually takes 2-3 minutes.

## Step 5: Open Your App
1.  At the top left of the dashboard, you will see your URL (e.g., `https://my-chat-app.onrender.com`).
2.  Click it to open your app!

---

## Important Note About Free Tier
Since this is a free server, it will "go to sleep" if no one uses it for 15 minutes.
*   **What this means:** The first time you open the link after a break, it might take **30-60 seconds to load**.
*   **After that:** It will be fast and normal.
