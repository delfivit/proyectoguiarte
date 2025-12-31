Quick test (curl) once you have the Web App URL

Replace <WEB_APP_URL> with the deployed URL.

curl -X POST '<WEB_APP_URL>' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","product":"Prueba","ts":"2025-12-31T14:42:11Z"}'

Notes:
- If you deployed as "Anyone (even anonymous)" this curl should succeed and return JSON {"status":"ok"}.
- If the browser fetch is blocked by CORS you can still test with curl or a server-side request.
