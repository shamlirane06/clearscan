# ClearScan — Scan Before You Trust

ClearScan is a QR and URL review assistant for anyone who wants to check a code or link before opening it, especially people receiving QR codes in public spaces, messages, invoices, or payment requests. QR codes can hide lookalike login pages, shortened destinations, or UPI payment details. ClearScan reads the destination first, explains the indicators it found, and gives the user a safer next step. It does not open scanned destinations or make payments.

## Current capabilities

- User-initiated camera QR reading, QR image upload (images up to 10 MB), and manual HTTP/HTTPS URL analysis. Camera/image decoding and UPI parsing run in the browser; only web URLs are sent to the scan API.
- Backend heuristic checks for URL structure, suspicious domain terms and TLDs, brand lookalikes, and known shortener domains.
- A weighted 0–100 risk score and the five classifications below.
- Optional Google Safe Browsing v4 lookup from the Java backend. The UI distinguishes `NOT_CONFIGURED`, `CHECKED_NO_MATCH`, `MATCH_FOUND`, `UNAVAILABLE`, and `NOT_CHECKED`.
- Local heuristic fallback when the backend times out, cannot be reached, or returns an invalid response. The report identifies itself as local-only; it does not imply a Google check occurred.
- UPI QR payload reading (`upi://pay`): shows the VPA, payee name, amount, and currency when present. Recipient identity is unverified. ClearScan does not open a payment app or initiate a payment.
- Browser-local scan history with a clear-all action. Stored links are reduced to their origin; URL path, query, fragment, and credentials are not retained in history.
- Safety education content and a quiz.

Message scanning is not implemented as a real analyzer and is not presented as a working scan feature. There is no user authentication or application database.

## Screenshots

Both images are captures of the running application: desktop at 1440 × 1000 and mobile at a 390 × 844 CSS viewport.

![ClearScan running at 1440 pixels wide](reports/clearscan-redesign/final/clearscan-live-desktop.png)

![ClearScan running at a 390-pixel mobile viewport](reports/clearscan-redesign/final/clearscan-live-mobile-390.png)

## Risk score and demo scenarios

Risk is calculated from the checks returned by the backend; the frontend does not assign a preset score. The backend takes the highest contribution and adds 40% of each other failed check's contribution, rounds to an integer, and caps the result at 100. A `CRITICAL` check enforces a minimum of 75. No failed checks produce 0. A required parsing or input guard failure produces -1 and `UNABLE_TO_VERIFY`.

| Risk score | Classification | Meaning |
| --- | --- | --- |
| 0–24 | `LOW_RISK` | No warning patterns were found in the checks that ran; this is not proof of safety. |
| 25–49 | `MODERATE_RISK` | Some unusual characteristics were found. |
| 50–74 | `HIGH_RISK` | Multiple or stronger suspicious indicators were found. |
| 75–100 | `CRITICAL_RISK` | Critical threat intelligence or a critical risk condition was reported. |
| -1 | `UNABLE_TO_VERIFY` | The input was unsupported, invalid, private, or required analysis could not complete. |

The current deterministic URL presets have these backend heuristic results when threat intelligence is not configured:

| Scenario | URL | Backend score |
| --- | --- | --- |
| Ordinary HTTPS | `https://www.wikipedia.org` | 0 (`LOW_RISK`) |
| Google lookalike and login path | `https://g00gle.com/login` | 41 (`MODERATE_RISK`) |
| Shortener and suspicious path | `https://bit.ly/sbi-urgent-update` | 26 (`MODERATE_RISK`) |
| Bank lookalike, HTTP, suspicious TLD and path | `http://sbi-kyc-update.xyz/verify` | 56 (`HIGH_RISK`) |
| Private destination | `http://localhost:8080/secret` | -1 (`UNABLE_TO_VERIFY`) |

The `testsafebrowsing.appspot.com` sample is only a Google Safe Browsing test target. It is not hardcoded as malicious. A match is reported only if the configured Google service returns one; with no key or an unavailable service, the report states that threat intelligence was not checked.

## Architecture

```mermaid
flowchart LR
  Person["User"] --> Browser["React + TypeScript app"]
  Browser -->|"camera or image QR decode"| QR["QR payload"]
  QR -->|"upi://pay"| Review["UPI detail review in browser"]
  QR -->|"HTTP/HTTPS URL"| API["POST /api/scan"]
  Browser -->|"manual URL"| API
  API --> Analysis["Spring Boot heuristic analysis"]
  Analysis -->|"optional URL lookup"| GSB["Google Safe Browsing"]
  Analysis --> Result["Score, evidence, action, check status"]
  Result --> Browser
  Browser -->|"origin-only records"| History["Browser localStorage"]
```

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, and `html5-qrcode`. The root `package.json` is the active app.
- **Backend:** Java 17, Spring Boot 3.2.5, Spring MVC, Jakarta validation, and Maven. Source is under `backend/`.
- **History:** browser `localStorage`, key `clearscan_history_v1`; no database is configured.
- **API:** `POST /api/scan`, JSON request `{ "url": "https://example.org" }`. The existing legacy `status` field is preserved; richer response fields include `riskScore`, `riskClassification`, `securityChecks`, `analysisSource`, and `threatIntelligenceStatus`.

Example response shape (values are illustrative; each scan is calculated from its input and live check outcomes):

```json
{
  "url": "https://www.wikipedia.org",
  "status": "UNABLE_TO_VERIFY",
  "message": "No threats were detected by the checks performed. This does not guarantee that the website is safe.",
  "normalizedHostname": "www.wikipedia.org",
  "riskScore": 0,
  "riskClassification": "LOW_RISK",
  "riskMessage": "No threats were detected by the checks performed. This does not guarantee that the website is safe.",
  "recommendedAction": "No immediate threats detected. Still verify the domain before entering personal information.",
  "timestamp": "2026-01-01T00:00:00Z",
  "analysisSource": "BACKEND",
  "threatIntelligenceAvailable": false,
  "threatIntelligenceStatus": "NOT_CONFIGURED",
  "securityChecks": [
    { "checkName": "URL Validation", "passed": true, "riskContribution": 0, "riskLevel": "LOW", "explanation": "URL uses HTTPS with a valid structure.", "evidence": "" },
    { "checkName": "Suspicious Domain Keywords", "passed": true, "riskContribution": 0, "riskLevel": "LOW", "explanation": "No suspicious keywords detected in the domain.", "evidence": "" },
    { "checkName": "Lookalike Domain Detection", "passed": true, "riskContribution": 0, "riskLevel": "LOW", "explanation": "No brand impersonation patterns were detected.", "evidence": "" },
    { "checkName": "URL Shortener Detection", "passed": true, "riskContribution": 0, "riskLevel": "LOW", "explanation": "This URL does not use a known URL-shortening service.", "evidence": "" },
    { "checkName": "URL Structure Analysis", "passed": true, "riskContribution": 0, "riskLevel": "LOW", "explanation": "No suspicious structural patterns detected in the URL.", "evidence": "" },
    { "checkName": "Threat Intelligence", "passed": false, "riskContribution": 0, "riskLevel": "INFO", "explanation": "Google Safe Browsing was not checked because it is not configured. Local URL heuristics still ran; this is not a safe-list check.", "evidence": "Service: Not configured" }
  ],
  "warnings": ["Google Safe Browsing was not checked because it is not configured. Local URL heuristics still ran; this is not a safe-list check."]
}
```

Backend scanning parses the submitted URL and sends the URL string as data to the optional Safe Browsing service. It does **not** fetch destination pages, resolve destination hostnames, follow redirects, or browse arbitrary sites. The SSRF guard rejects private and special-use IP literals and local hostnames; because the scanner does not connect to destination hosts, DNS rebinding cannot redirect a destination fetch. Shortener targets are not expanded.

## Setup and run

Requirements: Node.js compatible with the installed Vite version, npm, and Java 17. No API key is required for local heuristic analysis.

### Frontend

From the repository root:

```sh
npm install
npm run dev
```

The Vite server runs at `http://localhost:5173` by default. To point it at a different backend, set `VITE_API_BASE_URL`, for example `http://localhost:8081/api`.

### Backend

In another terminal:

```sh
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell, from `backend`, run `./mvnw.cmd spring-boot:run`. The server listens on port `8081`.

To enable Google Safe Browsing, configure the API key on the backend only:

```sh
GOOGLE_SAFE_BROWSING_API_KEY=your_key
CLEARSCAN_THREAT_INTEL_ENABLED=true
```

On PowerShell:

```powershell
$env:GOOGLE_SAFE_BROWSING_API_KEY = "your_key"
$env:CLEARSCAN_THREAT_INTEL_ENABLED = "true"
```

`clearscan.threat-intel.timeout-ms` controls the backend timeout (bounded to 250–15000 ms; default 5000 ms). Never add the API key to a `VITE_` variable or frontend source. Without both the enable flag and a key, the API reports `NOT_CONFIGURED`.

## Privacy and data handling

- Scan history exists in the current browser's local storage. The app stores only each URL origin there and removes path, query, fragment, and credentials. Clear history from the History page to delete saved records.
- The URL submitted for analysis, including its query string, is sent from the browser to the configured ClearScan backend. If Google Safe Browsing is enabled, the backend sends the full submitted URL to Google for the lookup.
- A UPI QR payload is parsed in the browser and is not sent to the URL scan API or added to URL history.
- The Google API key remains on the backend. Do not paste secrets into URLs you scan.

## Tests and build

```sh
npm test
npm run build
```

```sh
cd backend
./mvnw test
```

Results from this readiness pass:

- `npm test`: passed, 25 tests across 5 files.
- `npm run build`: passed TypeScript compilation and Vite production build. Vite reports a 702 kB minified JavaScript chunk, above its 500 kB advisory threshold.
- `cd backend; .\mvnw.cmd test`: passed, 39 tests, including MockMvc calls through `POST /api/scan` for the safe sample, synthetic phishing sample, localhost, and `upi://` rejection. SSRF, risk classifications, Safe Browsing failure states, and scoring are covered.
- Browser check: the manual URL form and safe/phishing demos rendered through the frontend analyzer; with no backend process running, reports identified local-only checks and Google Safe Browsing as not checked. The safe example returned 0 / `LOW_RISK`; the phishing example returned 56 / high risk with five evidence-backed warnings and did not navigate. The UPI sample displayed the supplied VPA, ₹100 amount, and unverified-identity warning, with no payment action. Camera remains off until the user chooses **Start camera**.
- Isolated browser history check: the phishing URL was saved as `http://sbi-kyc-update.xyz` only, matched the high-risk filter, and was deleted by the row action. No existing browser history was touched.
- Responsive layout probes reported zero horizontal overflow at 390, 768, and 1440 CSS pixels. Camera access was not granted in the headless browser; physical camera capture is not verified. QR image decoding is wired to the installed `html5-qrcode` `scanFile` API and type/build checked, but no separate image fixture decode was exercised in this pass.
- Backend tests ran on the available Java 25 runtime with Maven compiler target `--release 17`; a standalone Java 17 runtime was not installed in this environment.
- `npm run lint`: completed with 3 warnings in pre-existing shared UI modules and the Web Uplift runner.

## Limitations

- A low score is not a safe-site certification. Heuristics can miss new threats or flag legitimate unusual links.
- Google Safe Browsing requires a valid backend API key and may be unavailable or rate-limited.
- The backend does not follow redirects, expand short links, fetch web pages, or verify merchant/payee identity.
- UPI names and VPAs are values supplied by the QR payload, not verified identity claims.
- History is local to the browser. There is no sign-in, cross-device sync, database, or implemented message-scanning analyzer.
- The scanned URL is temporarily displayed in the report and sent to the backend. Avoid scanning links containing credentials or private tokens.

## SafeSpace Hacks 2026

### What existed in the project

The repository history shows the existing ClearScan project already had the React/Vite interface, backend URL heuristics and weighted risk scoring, camera QR reading, manual URL analysis, browser-local history, and security education. The history also shows a 2026-11-08 security-analysis update containing the UPI payload parser, Google Safe Browsing status handling, stronger URL/SSRF guards, history redaction, and related tests. These are treated as existing project work rather than newly claimed challenge work.

### Readiness work added for this demonstration

- Added QR image upload using the existing `html5-qrcode` decoder, with clear decode errors and a 10 MB file-size limit. The image stays in the browser.
- Added a reproducible three-scenario QR demo: ordinary HTTPS, a synthetic bank lookalike URL, and a synthetic UPI payment payload. The URL examples use the same backend scoring path as a manual scan; the UPI example uses the real parser and does not call the URL API.
- Added a history filter for `UNABLE_TO_VERIFY` records and improved the scanner retry path after camera or image errors.
- Expanded this README with the real workflow, architecture, privacy boundaries, and demo instructions.

The available repository history does not identify the official challenge start date, so the distinction above is based on the checked-in history and this readiness pass, not an independent event timeline.

### Practical safety improvement and demo outcomes

For the phishing demo, ClearScan analyzes `http://sbi-kyc-update.xyz/verify`, shows the backend score and its checks, and recommends not opening it. The analyzer submits the URL string to the ClearScan API but never visits the destination. For the payment demo, it extracts `Demo Store`, `demostore@upi`, and ₹100 INR from `upi://pay?pa=demostore%40upi&pn=Demo%20Store&am=100&cu=INR`; the UI explains that the QR-supplied recipient identity is unverified and offers no payment action.

One safer outcome is that a person can inspect a QR destination or payment request before choosing whether to proceed. One honest limitation is that heuristic checks can miss a new threat, and ClearScan does not verify merchant identity or certify a low-risk URL as safe.

### Exact demonstration steps

1. Start the backend and frontend as described below.
2. Open **Scan** and select **Camera Scanner**. Allow camera access to test the live reader, or select **Upload QR image** to decode an image.
3. Choose **Safe example · HTTPS**. Review the actual result and notice that a low heuristic score is not a safety guarantee. Google Safe Browsing shows its actual configured/unavailable state.
4. Reset, then choose **Synthetic phishing · lookalike**. Review the score, failed checks, evidence, and recommended action. Do not open the shown destination.
5. Reset, then choose **UPI payment QR · synthetic**. Confirm the payee and ₹100 INR display and the unverified-identity warning. No payment app is opened and no payment is initiated.
6. From **History**, search/filter results, delete an individual row, or clear all local history. URL records retain only the origin.
