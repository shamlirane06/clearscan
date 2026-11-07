# ClearScan — Scan Before You Trust 🛡️
> Intelligent Multi-Layer QR-Code & URL Security Assistant for Modern Phishing & Digital Payment Fraud Defense.

---

## 1. Project Overview & Problem Statement

### The Problem
QR codes have become ubiquitous across payment counters, restaurant tables, flyers, and parking meters. However, QR codes are inherently **blind trusts**: humans cannot visually read the underlying destination encoded in the 2D matrix. Cybercriminals exploit this through **Quishing (QR-code phishing)** and **reverse-intent payment fraud**:
- **Tampered Payment Stickers**: Scammers paste fraudulent QR stickers over merchant UPI and payment stands, routing payments directly to fraud accounts or sending disguised collect/mandate debits.
- **Credential Harvesting**: QR codes that lead to near-identical lookalike websites (e.g., `g00gle.com`, `sbi-kyc-update.xyz`) to steal login credentials, banking details, or OTPs.
- **Shortener Masking**: Links hidden behind services like `bit.ly` or `tinyurl.com` that bypass traditional email filters.
- **Mobile Browsing Blindspots**: Mobile viewports truncate domains, obscuring deep subdomains and malicious top-level domains.

### The Solution: ClearScan
ClearScan acts as an intelligent pause button before you trust or open any QR destination. Rather than merely presenting raw text or a basic binary SAFE/DANGEROUS label, ClearScan performs **modular multi-layer heuristic security inspection**, combines it with **real threat intelligence feeds**, and provides an **explainable 0–100 risk score** with granular evidence and actionable next steps.

---

## 2. Key Features

### 🛡️ 1. Intelligent Multi-Layer URL Risk Engine
ClearScan runs 6 comprehensive heuristic analyzers in sequence:
- **URL & Protocol Validation**: Enforces HTTP/HTTPS protocol checks, detects raw IPv4/IPv6 hosts, non-standard ports, and double or null-byte URL encoding.
- **SSRF Protection Shield**: Blocks attempts to scan localhost, loopback (`127.0.0.1`), private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local metadata addresses, and wildcard IPs.
- **Suspicious Domain & TLD Detection**: Flags deep subdomains (>4 levels), phishing keywords (`kyc`, `banking`, `verify`, `urgent`), and high-abuse top-level domains (`.xyz`, `.tk`, `.ml`, `.top`, `.buzz`).
- **Lookalike & Typosquatting Detection**: Uses algorithmic character substitution mapping (e.g., `0` for `o`, `1` for `l`, `3` for `e`) and brand containment verification against major tech and Indian banking institutions (`Google`, `Amazon`, `SBI`, `HDFC`, `ICICI`, `Paytm`, `Apple`). Punycode (`xn--`) internationalized domains are automatically flagged.
- **URL Shortener Inspection**: Identifies redirect masking services (`bit.ly`, `tinyurl`, `t.co`, `cutt.ly`, etc.) where the final destination is obscured.
- **URL Structural Analysis**: Analyzes excessive URL length (>200 chars), deceptive `@` symbol authorities, excessive query parameters (>10), and sensitive path keywords.

### 🌐 2. Real Threat Intelligence Integration
- **Google Safe Browsing API v4 Integration**: Backend evaluates URLs against global threat databases for malware, unwanted software, and social engineering.
- **Fail-Safe Operation**: If external threat intelligence is offline or rate-limited, ClearScan **never** marks the URL as safe; it clearly discloses fallback to local heuristic analysis.
- **Synthetic Demonstration Suite**: Pre-configured synthetic test URLs allow deterministic hackathon evaluation of confirmed malicious alerts without exposing judges to live malware.

### 📊 3. Explainable Security Results & Risk Meter
- **0–100 Heuristic Risk Score**: Non-linear weighted scoring with diminishing returns for multiple minor flags.
- **Floor Protection**: Confirmed critical threats automatically enforce a minimum risk score of 75.
- **Five Standard Risk Classifications**:
  - `0–24`: **LOW RISK** — No configured threats detected (with explicit reminder that safety is not guaranteed).
  - `25–49`: **MODERATE RISK** — Unusual characteristics detected; caution advised.
  - `50–74`: **HIGH RISK** — Multiple suspicious indicators; avoid opening.
  - `75–100`: **CRITICAL RISK** — Known malicious indicator or confirmed attack pattern; do not visit.
  - `UNABLE TO VERIFY`: Required security parsing could not complete; treat with extreme caution.
- **Audit-Ready Evidence**: Every check item provides clear, plain-language explanations along with concrete technical evidence.

### 🎓 4. Safety Education Mode ("Learn to Stay Safe")
- **Interactive Knowledge Base**: Detailed walkthroughs on quishing mechanics, fake UPI payment QR traps, recognizing lookalike domains, shortener risks, and post-scan incident steps.
- **Interactive Phishing Quiz**: 5 realistic multiple-choice scenarios with immediate feedback, detailed explanations, and score tracking.

### 🕒 5. Scan History & Risk Insights
- **Privacy-First Design**: Scans are stored exclusively in the client's local browser storage (`localStorage`). No browsing history or query parameters are tracked or persisted on central databases.
- **Filters & Search**: Filter history by risk tier, search by domain or keyword, view full drilldown security reports, or clear history in one click.
- **Local Metrics Dashboard**: Displays total inspected items, low-risk, suspicious, and critical scan counts labeled clearly as local activity.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Geist Variable Font
- **Icons**: Lucide React
- **Camera Scanning**: `html5-qrcode` (2.3.8)
- **Linter**: Oxlint

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.2.5 (Spring MVC)
- **HTTP Client**: Spring 6 `RestClient` with connect & read timeout protections
- **Validation**: Jakarta Bean Validation API
- **Build System**: Apache Maven 3.x
- **Testing**: JUnit 5 + Mockito

---

## 4. Architecture

```
ClearScan/
├── backend/                                   # Spring Boot Java 17 Backend
│   ├── pom.xml                                # Maven build specification
│   └── src/
│       ├── main/
│       │   ├── java/com/clearscan/backend/
│       │   │   ├── BackendApplication.java    # Application entry point
│       │   │   ├── analyzer/                  # Modular Security Analyzers
│       │   │   │   ├── SecurityAnalyzer.java
│       │   │   │   ├── UrlValidationAnalyzer.java
│       │   │   │   ├── SuspiciousDomainAnalyzer.java
│       │   │   │   ├── LookalikeDomainAnalyzer.java
│       │   │   │   ├── UrlShortenerAnalyzer.java
│       │   │   │   ├── UrlStructureAnalyzer.java
│       │   │   │   └── ThreatIntelligenceAnalyzer.java
│       │   │   ├── config/                    # CORS & RestClient timeouts
│       │   │   │   ├── RestClientConfig.java
│       │   │   │   └── WebConfig.java
│       │   │   ├── controller/                # Thin REST Controllers
│       │   │   │   └── ScanController.java
│       │   │   ├── dto/                       # Typed Request & Response DTOs
│       │   │   │   ├── ScanRequest.java
│       │   │   │   └── ScanResponse.java
│       │   │   ├── exception/                 # Global error handling
│       │   │   │   └── GlobalExceptionHandler.java
│       │   │   ├── model/                     # Enums & Results
│       │   │   │   ├── RiskClassification.java
│       │   │   │   └── SecurityCheckResult.java
│       │   │   ├── security/                  # SSRF & Network Protections
│       │   │   │   └── SsrfProtection.java
│       │   │   └── service/                   # Orchestration & Risk Calculation
│       │   │       ├── RiskScoringService.java
│       │   │       └── UrlAnalysisService.java
│       │   └── resources/
│       │       └── application.properties     # Config & Threat Intel keys
│       └── test/                              # Automated Unit Test Suite
│           └── java/com/clearscan/backend/
│               ├── analyzer/LookalikeDomainAnalyzerTest.java
│               ├── security/SsrfProtectionTest.java
│               └── service/UrlAnalysisServiceTest.java
└── src/                                       # React TypeScript Frontend
    ├── components/                            # UI Components
    │   ├── DashboardCard.tsx
    │   ├── Footer.tsx
    │   ├── Navbar.tsx
    │   ├── RiskMeter.tsx
    │   ├── Scanner.tsx
    │   ├── SecurityCheckItem.tsx
    │   ├── SecurityReport.tsx
    │   └── URLInput.tsx
    ├── pages/                                 # Multi-Page Navigation
    │   ├── AboutPage.tsx
    │   ├── Dashboard.tsx
    │   ├── HistoryPage.tsx
    │   ├── LearnPage.tsx
    │   └── ScannerPage.tsx
    ├── hooks/
    │   └── useScanHistory.ts                  # LocalStorage History Hook
    ├── services/
    │   └── scanService.ts                     # API & Client Heuristic Fallback
    ├── types/
    │   └── scan.ts                            # TypeScript Interfaces
    └── utils/
        └── validation.ts                      # Client-side validation & SSRF checks
```

---

## 5. API Documentation

### `POST /api/scan`
Inspects a URL against all heuristic analyzers and threat intelligence feeds.

#### Request Body
```json
{
  "url": "https://g00gle.com/security/login"
}
```

#### Response Body
```json
{
  "url": "https://g00gle.com/security/login",
  "status": "DANGEROUS",
  "message": "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source.",
  "normalizedHostname": "g00gle.com",
  "riskScore": 55,
  "riskClassification": "HIGH_RISK",
  "riskMessage": "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source.",
  "securityChecks": [
    {
      "checkName": "Lookalike Domain Detected",
      "passed": false,
      "riskContribution": 35,
      "riskLevel": "HIGH",
      "explanation": "The domain appears to impersonate \"google\" using character substitutions.",
      "evidence": "Domain: g00gle.com | Looks like: google"
    },
    {
      "checkName": "Suspicious Path Keywords",
      "passed": false,
      "riskContribution": 15,
      "riskLevel": "MEDIUM",
      "explanation": "The URL path contains sensitive keywords often used in phishing pages: login.",
      "evidence": "Path: /security/login"
    }
  ],
  "warnings": [
    "The domain appears to impersonate \"google\" using character substitutions.",
    "The URL path contains sensitive keywords often used in phishing pages: login."
  ],
  "recommendedAction": "Avoid opening this link. Multiple suspicious indicators were detected. Verify the source through trusted channels.",
  "timestamp": "2026-11-08T00:30:00Z",
  "threatIntelligenceAvailable": false
}
```

### `GET /api/health`
Returns backend health status.

---

## 6. Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Java 17 JDK
- Apache Maven 3.8+ (optional if using local IDE)

### Backend Setup
1. Open a terminal in `./backend`:
   ```bash
   cd backend
   ```
2. (Optional) Configure Google Safe Browsing API Key:
   ```bash
   # In PowerShell
   $env:GOOGLE_SAFE_BROWSING_API_KEY="your-api-key"
   $env:CLEARSCAN_THREAT_INTEL_ENABLED="true"
   ```
3. Run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   *The backend runs on port 8081 (`http://localhost:8081`).*

### Frontend Setup
1. Open a terminal in the root project directory:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on port 5173 (`http://localhost:5173`).*

---

## 7. Hackathon Demonstration Scenarios

ClearScan includes a built-in **One-Click Test Suite** on both the Dashboard and the Scanner page:

| Scenario | Sample Target | Expected Result | Demonstrated Capability |
|---|---|---|---|
| **1. Benign HTTPS** | `https://www.wikipedia.org` | **Score: 0 (LOW RISK)** | Clean HTTPS validation, standard ports, no warnings. |
| **2. Lookalike Domain** | `https://g00gle.com/login` | **Score: 55 (HIGH RISK)** | Typosquatting character substitution algorithm (`0` -> `o`). |
| **3. Masked Shortener** | `https://bit.ly/sbi-urgent-update` | **Score: 25+ (MODERATE RISK)** | Shortener service masking detection. |
| **4. Bank KYC Phishing** | `http://sbi-kyc-update.xyz/verify` | **Score: 65+ (HIGH RISK)** | Unencrypted HTTP, `.xyz` high-abuse TLD, brand mismatch, keywords. |
| **5. Synthetic Malicious** | `https://testsafebrowsing.appspot.com/malware` | **Score: 95+ (CRITICAL RISK)** | Synthetic test threat indicator, minimum floor enforcement (≥75). |
| **6. SSRF Protection** | `http://localhost:8080/admin` | **BLOCKED (UNABLE TO VERIFY)** | SSRF shield blocking internal loopback destinations. |

---

## 8. Honest Limitations & Disclaimer

- **No Absolute Immunity**: Heuristics are probabilistic indicators. A `LOW RISK` score indicates that no configured suspicious patterns were detected, but does not guarantee the destination is free of zero-day attacks.
- **Reporting Resources**: If money or data has been compromised, users are directed to report directly to official helplines (India: **1930** or [cybercrime.gov.in](https://cybercrime.gov.in)).

---

## 9. Pre-existing vs. Newly Developed Components

| Component | Status Before Upgrade | Upgraded / Implemented |
|---|---|---|
| **QR Camera Scanner** | Basic html5-qrcode scanner with simple SAFE/DANGEROUS status. | Full optical scanning with rich security report integration, error recovery, and desktop synthetic simulator. |
| **Backend Engine** | 3 keyword string matches (`login`, `ngrok`, `bit.ly`) in controller. | 6 modular analyzers, typed DTOs, SSRF protection, configurable RestClient, and exception advice. |
| **Risk Scoring** | Binary `SAFE` / `DANGEROUS`. | Mathematical 0–100 weighted risk scoring with 5 standard classifications. |
| **Threat Intelligence** | None. | Google Safe Browsing API v4 integration with fallback handling and synthetic test suites. |
| **Explainable Reports** | Static message string. | Visual SVG Risk Meter, granular evidence breakdown, and recommended actions. |
| **Education Section** | None. | "Learn to Stay Safe" knowledge base + interactive 5-question Phishing Quiz. |
| **Scan History** | None. | Privacy-first localStorage persistence with search, filtering, and metric stats. |
| **Navigation & UI** | Single static page with broken anchors. | Full 6-view responsive cybersecurity interface with Lucide icons. |

---

*ClearScan — Scan Before You Trust.* 🛡️
