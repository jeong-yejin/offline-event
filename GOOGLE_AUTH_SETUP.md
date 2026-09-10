# Google sign-in integration

The event introductions and Wonderland remain public. The PERP-DEX DAY and PERPS DAY prediction market entry points and direct URLs go through a sign-in modal. How much that modal proves depends on what is configured.

| Configured | Modal behaviour | What it proves |
| --- | --- | --- |
| Nothing | One button releases the gate | Nothing. It is a facade. |
| `VITE_GOOGLE_CLIENT_ID` only | Real Google sign-in, no server check | The browser received an ID token. Nothing verifies it. |
| Client ID and `VITE_GOOGLE_AUTH_ENDPOINT` | Real sign-in, server verifies the token | A participant the server accepted. |

This repository ships with neither variable set, so the gate is a facade by request. It keeps direct market URLs behind one deliberate click and nothing more. Adding the two variables below upgrades it with no code change.

Known issue at the facade level: the button reads "Continue with Google" and never contacts Google. Change the copy in `src/auth/GoogleLoginModal.tsx` if that matters before the event.

Set `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_AUTH_ENDPOINT` using `.env.example`. Register the actual development and deployment origins in the Google OAuth web client configuration. Never place a client secret in a Vite environment variable.

The configured server endpoint receives `POST { "credential": "<Google ID token>" }` with credentials included. It must verify the token signature, audience, issuer and expiry, identify the participant, and create its own secure HttpOnly session. Only then should it return HTTP 200 JSON `{ "authenticated": true }`. Rejections must return a non-success status. For a cross-origin endpoint, configure explicit allowed origins and credentialed CORS.

The frontend gate is not backend authorization at any of the three levels. Every market API must independently validate its session. No backend or OAuth client is supplied by this repository. Access lives in React state only and resets on refresh, prompting the modal again; nothing is written to browser storage. Persistent session restoration requires the application's session endpoint contract.

Reward account collection has been removed from event navigation; matching and payment happen outside this site after the competition.

Reference: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
