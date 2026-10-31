# Google Sign-In setup

FlowGrid uses the Google Identity Services authorization-code popup. The browser receives a short-lived authorization code; Django exchanges it using the server-only OAuth client secret and verifies the returned ID token before creating a session.

## Local setup

The root `.env` is loaded by Django and Docker Compose. Set:

```dotenv
OAUTH2_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
OAUTH2_GOOGLE_CLIENT_SECRET=your-web-client-secret
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Set the same client ID in `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Restart the web and API processes after changing environment variables. Never put the client secret in a `NEXT_PUBLIC_` variable or frontend source.

## Google Cloud Console

Create a **Web application** OAuth client. Add each exact frontend URL to **Authorized JavaScript origins**, including local development (`http://localhost:3000` and, if used, `http://127.0.0.1:3000`) and the deployed FlowGrid origin. For deployments using an OAuth redirect flow, add its exact callback URL under **Authorized redirect URIs**. This implementation uses the GIS popup code flow, so the frontend origin is also sent as the code-exchange redirect URI.

Configure the OAuth consent screen and add test users while the application is in testing mode. Production deployment requires the appropriate consent-screen verification and production frontend origins. Keep the API's `CORS_ALLOWED_ORIGINS` aligned with those frontend origins.
