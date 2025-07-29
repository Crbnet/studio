# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Connecting Your Firebase Project

This application is configured to use Firebase for authentication and database storage. To connect it to your own Firebase project, follow these steps:

1.  **Create a `.env` file:** In the root directory of the project, create a new file named `.env`.

2.  **Get your Firebase config:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project (or create a new one).
    *   In the project overview, click the Web icon (`</>`) to add a web app (or select an existing one).
    *   Go to your Project Settings (click the gear icon next to "Project Overview").
    *   In the "Your apps" card, find your web app.
    *   Under the "Firebase SDK snippet" section, select "Config".

3.  **Populate your `.env` file:** Copy the configuration object from the Firebase console. It will look something like this:

    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "123...",
      appId: "1:123...:web:abc..."
    };
    ```

    Now, copy these values into your `.env` file in the following format:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:123...:web:abc..."
    ```

4.  **Restart your development server:** If the server is running, stop it and restart it with `npm run dev`. This is necessary for Next.js to load the new environment variables.

## Deploying to a Hosting Provider (e.g., Vercel, Netlify)

When you deploy your application to a hosting provider, you **must not** upload your `.env` file. Instead, you need to configure the environment variables directly in your hosting provider's dashboard.

*   **Find the Environment Variables Section:** In your project settings on your hosting provider's website (e.g., Vercel, Netlify), find the section for "Environment Variables".
*   **Add Each Variable:** For each line in your `.env` file, you need to create a new environment variable.
    *   The **key** or **name** will be the part before the equals sign (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).
    *   The **value** will be the part in quotes after the equals sign.

This ensures your application can securely connect to your Firebase project when it's live on the internet.

Your application should now be fully connected to your Firebase project, and all data will be saved correctly.
