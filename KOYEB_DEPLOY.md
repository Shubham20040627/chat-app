# How to Deploy to Koyeb (Free Alternative)

**Koyeb** is a great alternative to Render. They provide a monthly free credit that is enough to run a small "Nano" instance for free.

## Step 1: Sign Up
1.  Go to **[koyeb.com](https://www.koyeb.com/)**.
2.  Click **"Sign Up"** and use **GitHub**.

## Step 2: Create App
1.  On the dashboard, click **"Create App"**.
2.  Select **"GitHub"** as the deployment method.
3.  Choose your repository: **`chat-app`**.

## Step 3: Configure
Koyeb usually auto-detects Node.js.
1.  **Builder:** `Standard` or `Buildpack` (Standard is fine).
2.  **Build Command:** `npm run build`
3.  **Run Command:** `npm start`
4.  **Instance:** Choose **"Nano"** (This is the smallest one covered by the free allowance).

## Step 4: Deploy
1.  Click **"Deploy"**.
2.  Wait for the build to finish.
3.  Koyeb will give you a public URL (e.g., `chat-app-user.koyeb.app`).

## Other Free Options (For Testing)
If Koyeb isn't for you, there is one more popular option for beginners:

### Glitch.com
*   **Pros:** Extremely easy, instant coding in the browser.
*   **Cons:** Not for "professional" hosting, project sleeps quickly, code is public by default.
*   **How:** Go to Glitch, click "New Project", import from GitHub, and it just runs.
