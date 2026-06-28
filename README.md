# acme-checkout

A small checkout service used to **demo Sentinel** end to end. It is the
"customer's production app" — Sentinel watches it via the self-hosted collector,
and a risky change to `computeTotal` is what we ship live on stage.

## Run

```bash
npm install
npm start            # http://localhost:8080
# or
docker build -t acme-checkout . && docker run -p 8080:8080 acme-checkout
```

## Endpoints

- `GET /health` → `{ "status": "ok" }`
- `POST /api/checkout` with `{ "cart": { "items": [{ "price": 10, "quantity": 2 }] } }` → `{ "total": 20, "currency": "USD" }`

## Demo narrative

1. Baseline `computeTotal` guards against an empty/missing cart.
2. A "refactor" PR removes the guard (subtle, touches the checkout critical path).
3. Merged + shipped → a request with no cart triggers an unhandled rejection →
   the worker exits → the Sentinel collector raises a `crash` incident.
4. Sentinel's triage surfaces that exact PR as the prime suspect.

## Troubleshooting

- Port 8080 in use: stop the other process or set PORT.
- Docker not running: start the daemon before npm start.
