# SCS Frontend

Next.js frontend for the SCS supply-chain inventory application.

## Branches and environments

| Branch | Purpose | Deployment |
|---|---|---|
| `main` | Production trunk | `https://scs-fe.vercel.app` |
| Feature/fix branches | Short-lived local development and pull requests | Vercel Git deployment disabled |

Create short-lived branches from `main`. Merge them back only through a pull
request after `frontend-release-gate` passes.

## First-time setup

### Requirements

- Git
- Node.js 20 LTS
- npm
- A local checkout of `scs-be` beside `scs-fe`
- Access to the development Supabase project

Recommended folder layout:

```text
GitHub/
├── scs-be/
└── scs-fe/
```

Clone the repository:

```bash
git clone https://github.com/scs-ph/scs-fe.git
cd scs-fe
```

Install exactly the dependencies recorded in `package-lock.json`:

```bash
npm ci
```

Always run `npm ci` after a fresh clone or a dependency-lock change. If
`npm run dev` reports that `next` is not recognized, `node_modules` is missing
or incomplete; run `npm ci` again.

## Development environment

The frontend uses:

- the local FastAPI backend at `http://127.0.0.1:8000`;
- the development Supabase URL;
- the development Supabase anon/publishable key.

It must never contain a Supabase service-role key.

### WSL or Git Bash

With `scs-be` and `scs-fe` as sibling folders, run this from `scs-fe`:

```bash
BE=../scs-be/.env
FE=.env.development.local

url="$(grep -m1 '^SUPABASE_URL=' "$BE" | cut -d= -f2- | tr -d '\r')"
key="$(grep -m1 '^SUPABASE_KEY=' "$BE" | cut -d= -f2- | tr -d '\r')"

test -n "$url" && test -n "$key" || {
  echo "Missing SUPABASE_URL or SUPABASE_KEY in $BE" >&2
  exit 1
}

role="$(node -e '
const key = process.argv[1];
if (key.startsWith("sb_publishable_")) {
  console.log("publishable");
} else {
  const payload = key.split(".")[1];
  if (!payload) process.exit(1);
  console.log(JSON.parse(Buffer.from(payload, "base64url")).role || "");
}
' "$key")"

case "$role" in
  anon|publishable) ;;
  *)
    echo "Refusing to expose a non-anon Supabase key in the frontend" >&2
    exit 1
    ;;
esac

printf '%s\n' \
  'NEXT_PUBLIC_API_URL=http://127.0.0.1:8000' \
  "NEXT_PUBLIC_SUPABASE_URL_A=$url" \
  "NEXT_PUBLIC_SUPABASE_ANON_KEY_A=$key" \
  > "$FE"

chmod 600 "$FE" 2>/dev/null || true
echo "Created $FE"
```

### Windows PowerShell

Run this from `scs-fe`:

```powershell
$be = Get-Content ..\scs-be\.env
$url = (($be | Where-Object { $_ -match '^SUPABASE_URL=' }) -split '=', 2)[1]
$key = (($be | Where-Object { $_ -match '^SUPABASE_KEY=' }) -split '=', 2)[1]

if (-not $url -or -not $key) {
  throw "Missing SUPABASE_URL or SUPABASE_KEY in ..\scs-be\.env"
}

$keyCheck = @'
const key = process.argv[1];
if (key.startsWith('sb_publishable_')) {
  console.log('publishable');
} else {
  const payload = key.split('.')[1];
  if (!payload) process.exit(1);
  console.log(JSON.parse(Buffer.from(payload, 'base64url')).role || '');
}
'@

$role = node -e $keyCheck $key

if ($LASTEXITCODE -ne 0 -or $role -notin @("anon", "publishable")) {
  throw "Refusing to expose a non-anon Supabase key in the frontend"
}

@"
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SUPABASE_URL_A=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY_A=$key
"@ | Set-Content -Encoding ascii .env.development.local
```

The file is ignored by Git. Restart Next.js after changing any environment
variable.

## Run locally

Start `scs-be` first, then:

```bash
npm run dev
```

Open `http://localhost:3000`.

In browser developer tools, confirm requests use:

- `http://127.0.0.1:8000` for the backend;
- the development Supabase project, not production.

## Verification

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

Install bundled Chromium once:

```bash
npx playwright install chromium
```

PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = "chromium"
npm run test:e2e
npm run ci
```

Git Bash/WSL:

```bash
PLAYWRIGHT_CHANNEL=chromium npm run test:e2e
PLAYWRIGHT_CHANNEL=chromium npm run ci
```

Without `PLAYWRIGHT_CHANNEL=chromium`, Playwright uses an installed Google
Chrome channel.

`backend-version.json` pins the current backend `main` commit and OpenAPI hash.
The frontend release gate fails when that pin is stale, when the backend
evidence is missing or not green, or when the OpenAPI hash differs.

## Troubleshooting

### `next` is not recognized

```bash
npm ci
npm run dev
```

### Port 3000 is already in use

PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object LocalPort, OwningProcess

Stop-Process -Id <PID>
```

WSL/Linux:

```bash
ss -ltnp | grep ':3000'
kill <PID>
```

### Environment changes are ignored

Stop and restart `npm run dev`. Next.js reads `.env.development.local` at
startup.

### Local requests reach production

Stop the frontend immediately and verify `.env.development.local`. Local
development should use the local backend and development Supabase project.

## Release documentation

See [`docs/CI_RELEASE_GATE.md`](docs/CI_RELEASE_GATE.md) for branch,
environment, backend-pin, Vercel, and emergency-release rules.
