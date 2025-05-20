# Firebase Setup Instructions

## Issues Fixed
1. **No Firebase App '[DEFAULT]' has been created**: This error was caused by the Firebase app not being properly initialized before use.
2. **Firebase: Error (auth/invalid-api-key)**: This error occurs when the Firebase API key is invalid or missing.

These issues have been fixed by:
1. Ensuring Firebase is properly initialized in `client/src/firebase.ts`
2. Adding automatic detection of missing Firebase configuration values
3. Creating a mock Firebase implementation for development mode when config values are unavailable

## Environment Variables Setup
To configure Firebase, create a `.env` file in the client directory with the following variables:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Replace the placeholder values with your actual Firebase project credentials from the Firebase console.

## Development Mode
The application now features two modes:

1. **Production Mode**: Requires valid Firebase configuration values
2. **Development Mode**: Can work without Firebase configuration by using a mock implementation

If you're in development mode and don't provide Firebase configuration, the app will:
- Automatically use a mock Firebase implementation
- Log a warning in the console
- Allow you to develop and test the UI without a real Firebase connection

For full functionality (including authentication), you should still provide valid Firebase configuration values even in development.

## Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Add a web app to your project
4. Copy the configuration values to your .env file
5. Enable Authentication in the Firebase Console
6. Set up the authentication methods you want to use (Email/Password, Google, etc.)

After setting up these environment variables and ensuring Firebase is properly initialized, the app should work correctly. 