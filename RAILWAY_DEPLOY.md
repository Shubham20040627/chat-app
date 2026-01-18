# How to Deploy to Railway (Simple Step-by-Step)

This guide will show you exactly how to put your chat app on the internet using Railway. It is free to start and very easy.

## Prerequisites
1.  **GitHub Account**: You need to have your code on GitHub (which you already do!).
2.  **Railway Account**: You can sign up using your GitHub account.

---

## Step 1: Sign Up for Railway
1.  Go to **[railway.app](https://railway.app/)**.
2.  Click the **"Login"** button in the top right.
3.  Select **"Login with GitHub"**.
4.  Authorize Railway to access your GitHub account.

## Step 2: Create a New Project
1.  Once logged in, you will see your dashboard. Click the big **"+ New Project"** button.
2.  Select **"Deploy from GitHub repo"** from the list.
3.  You will see a list of your GitHub repositories. Search for or select **`chat-app`**.
4.  Click **"Deploy Now"**.

## Step 3: Verify Settings (Optional but Recommended)
Railway is smart and usually detects everything automatically because we added the `start` script. But just to be safe:

1.  Click on your new project card to open it.
2.  Click on the **"Settings"** tab.
3.  Scroll down to the **"Build & Deploy"** section.
4.  Check these fields:
    *   **Build Command**: It should say `npm run build`.
    *   **Start Command**: It should say `npm start`.
5.  If they are empty or different, type them in and click Save.

## Step 4: Get Your Website URL
1.  Wait for the deployment to finish (you'll see a green "Success" checkmark).
2.  Click on the **"Settings"** tab again.
3.  Scroll to the **"Networking"** or **"Environment"** section.
4.  Railway might automatically generate a domain (e.g., `chat-app-production.up.railway.app`).
5.  If you don't see a domain, look for a button that says **"Generate Domain"** and click it.
6.  Click that link—your chat app is now live!

## Step 5: Share with Friends
*   Copy that URL and send it to your friends.
*   They can open it on their phones or laptops.
*   Everyone can chat in real-time!

---

## Troubleshooting
*   **"Application Error"**: Go to the **"Deployments"** tab and click on the latest deployment to see the **"Deploy Logs"**. It will tell you if something crashed.
*   **White Screen**: This usually means the `build` failed. Check the logs.
