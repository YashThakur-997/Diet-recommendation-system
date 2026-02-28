# Diet-recommendation-system

## Google Sign-In

1. **Google Cloud Console**: Create an OAuth 2.0 Client ID (Web application) at [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials). Add your Authorized JavaScript origins (e.g. `http://localhost:5173` for dev).
2. **Backend**: In `server/.env` set `GOOGLE_CLIENT_ID` to that client ID.
3. **Frontend**: Create `client/.env` with `VITE_GOOGLE_CLIENT_ID` set to the **same** client ID (so the browser can load the Google button and the server can verify tokens).
4. Restart the dev server and client; the Sign In page will show the Google button and use real Google auth (no dummy data).