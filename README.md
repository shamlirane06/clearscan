<div align="center">

<img src="docs/screenshots/clearscan-logo.png" alt="ClearScan Logo" width="80" height="80" />

# ClearScan

### *Scan Before You Trust.*

**A privacy-preserving QR code and URL security review assistant engineered to inspect destinations, detect deception indicators, and deliver explainable threat dossiers before a link or transaction is opened.**

[![React](https://img.shields.io/badge/React-19.3-20232A?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Java](https://img.shields.io/badge/Java-17_LTS-ED8B00?style=flat-square&logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Google Safe Browsing](https://img.shields.io/badge/Google_Safe_Browsing-v4_Ready-4285F4?style=flat-square&logo=google)](https://developers.google.com/safe-browsing)
[![Vitest](https://img.shields.io/badge/Vitest-50_Passed-10B981?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Execution_Auditing-176b50?style=flat-square)](#9-system-architecture)

<br/>

![ClearScan Main Dashboard](docs/screenshots/dashboard.jpg)

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [The Problem](#2-the-problem)
3. [Our Solution](#3-our-solution)
4. [Key Features](#4-key-features)
5. [Complete Application Workflow](#5-complete-application-workflow)
6. [Risk Scoring Methodology](#6-risk-scoring-methodology)
7. [Google Safe Browsing Integration](#7-google-safe-browsing-integration)
8. [System Architecture](#8-system-architecture)
9. [Technology Stack](#9-technology-stack)
10. [API Documentation](#10-api-documentation)
11. [Project Folder Structure](#11-project-folder-structure)
12. [Application Screenshot Gallery](#12-application-screenshot-gallery)
13. [Privacy and Security Boundaries](#13-privacy-and-security-boundaries)
14. [Implemented vs Planned Features](#14-implemented-vs-planned-features)
15. [Limitations and Responsible Use](#15-limitations-and-responsible-use)
16. [Installation and Local Setup](#16-installation-and-local-setup)
17. [Testing and Quality Assurance](#17-testing-and-quality-assurance)
18. [Hackathon Demonstration Guide](#18-hackathon-demonstration-guide)
19. [Future Scope](#19-future-scope)
20. [Team and Acknowledgements](#20-team-and-acknowledgements)

---

## 1. Project Overview

Quick Response (QR) codes and shortened hyperlinks permeate everyday life—from restaurant menus, transit gates, parking meters, and event ticketing to utility bills, payment counters, and unsolicited messaging. However, QR codes encode binary payloads that are completely opaque to human inspection. Standard camera applications and mobile operating systems automatically trigger immediate browser navigation or payment initiation the moment a code is decoded, stripping users of the opportunity to evaluate the target URL or financial recipient.

**ClearScan** is a cybersecurity assistant built around a single, foundational principle: **Zero-Execution Auditing**. It acts as a safety checkpoint between optical QR code decoding and actual destination interaction. ClearScan reads the embedded payload, verifies whether it represents a web destination or a financial request, inspects syntactic, lexical, and structural characteristics, queries optional external threat intelligence, calculates an explainable weighted risk score (0–100), and presents actionable recommendations—**without ever opening the target website or executing a payment transaction**.

### Intended Audience

- **General Consumers & Mobile Users:** Individuals navigating everyday public physical spaces where malicious QR stickers may overwrite legitimate codes.
- **Enterprise & Organization Staff:** Professionals targeted with QR-based spear-phishing campaigns ("quishing") designed to bypass traditional enterprise email perimeter firewalls.
- **Digital Payment Users:** Consumers in peer-to-peer and merchant ecosystems (such as India's Unified Payments Interface - UPI) vulnerable to deceptive collect requests and altered payment targets.

---

## 2. The Problem

The optical convenience of QR codes has created significant blind spots in user security models:

```
┌─────────────────┐       Blind Navigation      ┌───────────────────────────┐
│ Malicious QR    │ ──────────────────────────> │ Phishing Site / Exploit   │
│ Code / Link     │   (Camera app opens link)   │ Credential Theft / Fraud  │
└─────────────────┘                             └───────────────────────────┘
                                ▲
                     NO INSPECTION WINDOW
```

1. **Quishing (QR Code Phishing):** Attackers increasingly embed deceptive URLs inside QR codes attached to emails or physical posters. Because traditional text-based email security gateways (ESGs) and anti-spam filters inspect raw message text and attachments rather than decoding optical image payloads, quishing bypasses standard perimeter defenses.
2. **Visual Obfuscation & Screen Truncation:** Mobile browsers and handheld devices inherently restrict URL bar visibility. Long paths, subdomains, and obfuscated query strings conceal the true domain origin.
3. **Domain Impersonation & Typosquatting:** Attackers register lookalike domains using character substitutions (e.g., `g00gle.com` for Google, `paypa1.com` for PayPal) or internationalized Punycode homoglyphs (`xn--...`) to deceive unsuspecting victims.
4. **Opaque URL Shorteners:** Services like `bit.ly`, `tinyurl.com`, or `t.co` completely mask the final hostname, routing, and parameters until HTTP redirection chains execute.
5. **Physical Sticker Tampering:** In retail, dining, and municipal parking zones, fraudsters overlay fraudulent QR code stickers on top of authentic merchant stands, diverting payments or harvesting credit credentials.
6. **Payment Request Reversal (UPI Exploits):** Fraudsters send QR codes or payment links claiming that scanning them is required to "receive" cash prizes or refunds, when in reality scanning an inverted `upi://pay` request authorizes an immediate debit from the victim's account.

---

## 3. Our Solution

ClearScan introduces an intermediate defensive inspection layer that intercepts QR code payloads and hyperlinks before device execution:

```
┌──────────────────┐      Payload Read      ┌────────────────────────┐      Detailed Dossier      ┌──────────────────┐
│ QR Code / Image  │ ─────────────────────> │       ClearScan        │ ─────────────────────────> │ User Decides     │
│ Manual URL Input │                        │   Zero-Execution Audit │                            │ With Full Context│
└──────────────────┘                        └────────────────────────┘                            └──────────────────┘
                                                        │
                                            No Redirects Followed
                                            No Destination Fetched
                                            No Payments Initiated
```

### Complete 10-Step Security Review Lifecycle

1. **Optical Capture:** User scans a physical QR code using the in-browser camera stream or uploads a local QR image file.
2. **Client-Side Decoding:** The `html5-qrcode` engine runs strictly in the browser sandbox to decode raw text from image matrices.
3. **Payload Classification:** The payload is immediately categorized as a web destination (`http://`, `https://`, domain string), a UPI payment link (`upi://pay`), or arbitrary text.
4. **Client-Side Protocol Guard:** Web destinations are validated and normalized; non-web schemas (such as `file://`, `javascript:`, `ftp://`) and embedded credentials (`user:pass@host`) are isolated.
5. **Server-Side Submission:** If the payload is a valid web URL, it is transmitted via `POST /api/scan` to the Spring Boot backend.
6. **SSRF & Address Protection:** The backend validates hostname syntax and enforces strict Server-Side Request Forgery (SSRF) checks, rejecting private, loopback, link-local, and reserved IP address spaces (`10.0.0.0/8`, `127.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`, IPv6 loopbacks, etc.).
7. **Heuristic Engine Execution:** The backend runs five deterministic local analyzers across protocol validity, brand lookalikes, suspicious keywords, high-risk TLDs, and URL structural patterns.
8. **Threat Intelligence Query:** If configured and available, Google Safe Browsing v4 is queried for known malware, social engineering, and harmful application signatures.
9. **Weighted Risk Scoring:** Risk contributions from all completed checks are aggregated using ClearScan’s diminishing-returns formula into a unified 0–100 score and five-tier classification.
10. **Explainable Dossier Presentation:** The user receives a comprehensive visual report displaying the risk score, security check breakdown, concrete evidence strings, specific warnings, and recommended actions.

> [!IMPORTANT]
> **UPI Payment Payloads are Handled Exclusively in the Browser.**
> Financial payloads (`upi://pay`) are parsed entirely client-side. ClearScan extracts visible parameters (Payee Name, Virtual Payment Address, Amount, Currency) and displays an explicit unverified identity warning. The payload is never sent to the backend URL scan API, never saved in history, and never triggers external payment applications.

---

## 4. Key Features

### Camera-Based QR Scanning
- **What it does:** Uses the device video input to detect and decode QR codes in real time.
- **How it works:** Powered by `html5-qrcode` running an in-browser canvas decoder. A custom CSS reticle frame guides alignment.
- **What the user sees:** A live camera feed with an active scanning reticle, pulsing laser indicator, and camera toggle control.
- **Why it is useful:** Allows immediate optical scanning without granting background camera access or allowing third-party camera apps to execute URLs silently.

### QR Image Upload
- **What it does:** Allows users to inspect QR codes captured in screenshots, flyers, or received via chat.
- **How it works:** Reads local image files (`PNG`, `JPEG`, `WEBP`) up to 10 MB and processes the matrix in client memory without uploading image binaries to any remote server.
- **What the user sees:** A dedicated upload dropzone with immediate file validation and decode status.
- **Why it is useful:** Protects against invoice fraud, screenshot scams, and quishing emails delivered as image attachments.

### Manual URL Analysis
- **What it does:** Provides a dedicated text input for inspecting suspicious web links copied from emails, SMS, or websites.
- **How it works:** Validates format, normalizes protocol schemes, and submits strings to the scanning pipeline.
- **What the user sees:** A clean search-style input with real-time syntax validation, quick-link preset chips, and a one-click reset action.
- **Why it is useful:** Enables users to verify suspicious links received via communication channels without opening their browser.

### URL Structure & Protocol Validation
- **What it does:** Detects transport security weaknesses, non-standard ports, obfuscated `@` authority symbols, excessive lengths, and suspicious query counts.
- **How it works:** Analyzes the URI structure against security thresholds (length > 200 chars, query parameters > 10, non-standard HTTP ports outside 80/443, raw IP literals).
- **What the user sees:** Specific checks flagged in the security dossier detailing the exact structural anomaly.
- **Why it is useful:** Prevents attackers from using structural evasion tactics to disguise destinations or exploit browser parsing differences.

### Suspicious Domain Keyword Detection
- **What it does:** Scans domain hostnames for urgent, account-related, or financial terminology.
- **How it works:** Compares domain tokens against a curated security catalog (`login`, `verify`, `secure`, `update`, `account`, `banking`, `confirm`, `suspend`, `alert`, `urgent`, `password`, `signin`, `credential`, `wallet`, `helpdesk`, `kyc`).
- **What the user sees:** A flagged check highlighting the exact matched keywords in the domain.
- **Why it is useful:** Flags social engineering traps that create false urgency to steal credentials.

### Suspicious TLD Detection
- **What it does:** Identifies top-level domains statistically associated with disposable phishing campaigns.
- **How it works:** Evaluates the hostname extension against known high-risk TLDs (`.xyz`, `.tk`, `.ml`, `.ga`, `.cf`, `.gq`, `.top`, `.work`, `.click`, `.link`, `.buzz`, `.rest`, `.icu`, `.cam`).
- **What the user sees:** An informative warning identifying the high-risk TLD.
- **Why it is useful:** Alerts users when a destination relies on cheap or unregulated registries favored by transient phishing operations.

### Brand Lookalike & Typosquatting Detection
- **What it does:** Identifies phishing domains impersonating major financial, tech, and retail brands.
- **How it works:** Normalizes character substitutions (leet-speak glyphs: `0` $\to$ `o`, `1` $\to$ `l`, `3` $\to$ `e`, `4` $\to$ `a`, `5` $\to$ `s`, `7` $\to$ `t`, `9` $\to$ `g`, `@` $\to$ `a`, `$` $\to$ `s`) and checks for unauthorized inclusions of protected brands (`google`, `amazon`, `facebook`, `microsoft`, `apple`, `paypal`, `netflix`, `instagram`, `whatsapp`, `sbi`, `hdfc`, `icici`, `paytm`, `phonepe`, `gpay`). It also detects Punycode (`xn--...`) homograph attacks.
- **What the user sees:** High-severity check results indicating the brand being imitated and official legitimate domains.
- **Why it is useful:** Stops deceptive lookalikes that trick victims into entering banking or corporate credentials.

### Known URL Shortener Detection
- **What it does:** Flags URLs utilizing shortening services that hide the final target destination.
- **How it works:** Matches hostnames against verified shortener domains (`bit.ly`, `tinyurl.com`, `t.co`, `goo.gl`, `ow.ly`, `is.gd`, `buff.ly`, `rebrand.ly`, `rb.gy`, `short.io`, `cutt.ly`, etc.).
- **What the user sees:** An advisory notice explaining that the final destination is obscured.
- **Why it is useful:** Prevents blind clicks through redirect chains that bypass preliminary domain inspection.

### Weighted Risk Scoring & Classifications
- **What it does:** Computes a unified 0–100 risk score and maps it to five clear security classifications.
- **How it works:** Uses a diminishing-returns mathematical model that combines the primary risk indicator with weighted secondary findings.
- **What the user sees:** A color-coded Risk Meter with clear status badges, textual summary, and actionable guidance.
- **Why it is useful:** Translates complex technical security checks into an intuitive decision metric.

### Google Safe Browsing v4 Integration
- **What it does:** Provides optional external threat intelligence queries against Google’s repository of malicious links.
- **How it works:** Calls `safebrowsing.googleapis.com/v4/threatMatches:find` via a secure Spring Boot `RestClient` using a server-side API key.
- **What the user sees:** Explicit status reporting distinguishing verified checks from unconfigured states.
- **Why it is useful:** Correlates local heuristic analysis with global reputation telemetry.

### Local Heuristic Fallback Engine
- **What it does:** Guarantees uninterrupted security analysis even if the backend is unreachable or offline.
- **How it works:** The frontend mirrors backend heuristic analyzers; if `POST /api/scan` times out or fails, the browser analyzer runs automatically.
- **What the user sees:** A banner stating that local-only heuristics were used and external threat intelligence was not queried.
- **Why it is useful:** Ensures continuous defense in offline or resource-constrained settings without silent security degradation.

### UPI QR Payload Inspection
- **What it does:** Decodes and parses `upi://pay` payment parameters.
- **How it works:** Extracts Payee Name (`pn`), Virtual Payment Address (`pa`), Amount (`am`), and Currency (`cu`).
- **What the user sees:** A structured payment review card displaying extracted transaction parameters and an unverified recipient warning.
- **Why it is useful:** Protects users against fraudulent collect requests, fake merchant stickers, and reversed-intent payment scams.

### Privacy-Preserving Scan History
- **What it does:** Maintains a chronological audit log of previously scanned links in browser storage.
- **How it works:** Stored in browser `localStorage` (`clearscan_history_v1`). URLs are automatically sanitized to strip sensitive credentials.
- **What the user sees:** A filterable history table with date ranges, risk categories, single-item deletion, and a clear-all action.
- **Why it is useful:** Allows users to review past investigations without exposing sensitive session tokens or query secrets.

### Security Education & Interactive Safety Quiz
- **What it does:** Educates users on modern social engineering, quishing tactics, and secure link hygiene.
- **How it works:** Interactive accordion knowledge modules and a multi-question security quiz with immediate explanatory feedback.
- **What the user sees:** Engaging learning cards covering Quishing, Fake Payment QRs, Typosquatting, and Shortener risks.
- **Why it is useful:** Builds human cyber resilience alongside automated technical auditing.

---

## 5. Complete Application Workflow

ClearScan enforces strict separation between client-side decoding, server-side heuristic analysis, and external threat intelligence queries.

### Process Flowchart

```mermaid
flowchart TD
    Start(["Input: Camera QR / Image Upload / Manual URL"]) --> ModeCheck{"Input Type?"}
    
    %% Camera & Image Branch
    ModeCheck -->|"Camera QR / Image File"| Decode["html5-qrcode Client Decoder<br/>(Browser Sandbox)"]
    Decode --> DecodedPayload{"Decoded Format?"}
    
    %% UPI Branch
    DecodedPayload -->|"upi://pay Schema"| UPI["Browser UPI Parser<br/>(Extracts VPA, Name, Amount)"]
    UPI --> UPIView["Display Payment Review Modal<br/>(Explicit Unverified Payee Warning)<br/>*No Network Transmission*"]
    
    %% Plain Text Branch
    DecodedPayload -->|"Non-URL Plain Text"| TextModal["Display Raw Decoded Text Modal<br/>*No Analysis Executed*"]
    
    %% URL Branches
    DecodedPayload -->|"HTTP/HTTPS URL"| ClientValidate["Client URL Normalization & Guards"]
    ModeCheck -->|"Manual URL"| ClientValidate
    
    ClientValidate --> SSRFClient{"Malformed or Private Host?"}
    SSRFClient -->|"Yes"| ClientReject["Client Fallback: Score -1<br/>UNABLE_TO_VERIFY"]
    
    SSRFClient -->|"Valid Web URL"| APISend["POST /api/scan<br/>(Payload: JSON { url })"]
    
    %% Backend Processing
    APISend --> BackendReach{"Backend Reachable?"}
    BackendReach -->|"Timeout / Error"| Fallback["Client-Side Fallback Engine<br/>Local Heuristics Only"]
    Fallback --> RenderReport["Render Security Report Dossier"]
    
    BackendReach -->|"HTTP 200 OK"| BackendEngine["Spring Boot 3.2.5 Backend"]
    BackendEngine --> SSRFServer{"SSRF Protection Check<br/>(SsrfProtection.java)"}
    SSRFServer -->|"Private/Loopback/Reserved"| RejectSSRF["Reject with UNABLE_TO_VERIFY<br/>Score: -1"]
    
    SSRFServer -->|"Public Destination"| Analyzers["Execute Security Analyzers"]
    
    subgraph AnalyzersExecution ["Deterministic Local Analyzers"]
        direction TB
        A1["UrlValidationAnalyzer (Protocol, Ports, Encoding)"]
        A2["SuspiciousDomainAnalyzer (Keywords, TLDs, Subdomains)"]
        A3["LookalikeDomainAnalyzer (Brands, Punycode, Leet)"]
        A4["UrlShortenerAnalyzer (Known Shortener Services)"]
        A5["UrlStructureAnalyzer (Path Words, Length, @, Query)"]
    end
    
    Analyzers --> AnalyzersExecution
    AnalyzersExecution --> GSBCheck{"Threat Intel Configured?<br/>(API Key + Enabled Flag)"}
    
    GSBCheck -->|"Yes"| GSBQuery["Google Safe Browsing v4 API<br/>safebrowsing.googleapis.com"]
    GSBCheck -->|"No"| GSBNotConfig["Status: NOT_CONFIGURED<br/>Check marked INFO"]
    
    GSBQuery --> ThreatStatus{"Threat Match Found?"}
    ThreatStatus -->|"Match Found"| ThreatCritical["Status: MATCH_FOUND<br/>CRITICAL Risk Check (Forces Min 75)"]
    ThreatStatus -->|"No Match"| ThreatClean["Status: CHECKED_NO_MATCH<br/>Risk Contribution: 0"]
    ThreatStatus -->|"Network Error"| ThreatUnavail["Status: UNAVAILABLE<br/>Check marked INFO"]
    
    AnalyzersExecution --> RiskCalc["RiskScoringService<br/>Diminishing Returns Formula"]
    ThreatCritical --> RiskCalc
    ThreatClean --> RiskCalc
    ThreatUnavail --> RiskCalc
    GSBNotConfig --> RiskCalc
    
    RiskCalc --> JSONResponse["Build ScanResponse JSON<br/>(Score, Class, Checks, Action)"]
    RejectSSRF --> JSONResponse
    JSONResponse --> FrontendReceive["Frontend Receives ScanResponse"]
    FrontendReceive --> RenderReport
    
    RenderReport --> SaveHistory["Sanitize Credentials & Log to<br/>localStorage ('clearscan_history_v1')"]
```

### Frontend-Backend Interaction Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Browser UI (React 19)
    participant ClientDec as Client Decoder (html5-qrcode)
    participant Backend as ClearScan Backend (Spring Boot)
    participant GSB as Google Safe Browsing v4 (External)
    participant Storage as Browser localStorage

    alt Camera / Image QR Flow
        User->>Browser: Selects Camera or Uploads Image
        Browser->>ClientDec: Decodes optical bitmap
        ClientDec-->>Browser: Returns decoded string payload
    else Manual URL Flow
        User->>Browser: Enters target URL in input
    end

    alt UPI QR Payload Detected (upi://pay)
        Browser->>Browser: parseUpiPayPayload() extracts VPA, name, amount
        Browser->>User: Displays UPI Payment Review Modal (Unverified Payee Warning)
        Note over Browser,Backend: No network calls made; payload not sent to API
    else Web Destination Detected (http://, https://)
        Browser->>Browser: Normalizes scheme, strips embedded credentials
        Browser->>Backend: POST /api/scan { "url": "..." }
        
        activate Backend
        Backend->>Backend: Enforce SSRF protection (reject private/loopback IPs)
        Backend->>Backend: Run UrlValidationAnalyzer
        Backend->>Backend: Run SuspiciousDomainAnalyzer
        Backend->>Backend: Run LookalikeDomainAnalyzer
        Backend->>Backend: Run UrlShortenerAnalyzer
        Backend->>Backend: Run UrlStructureAnalyzer
        
        opt Google Safe Browsing Configured
            Backend->>GSB: POST /v4/threatMatches:find?key={API_KEY}
            activate GSB
            GSB-->>Backend: Returns threat matches JSON
            deactivate GSB
        end
        
        Backend->>Backend: RiskScoringService.calculateRiskScore()
        Backend->>Backend: RiskClassification.fromScore()
        Backend-->>Browser: Returns ScanResponse JSON
        deactivate Backend
        
        Browser->>User: Displays Security Report Dossier
        Browser->>Storage: Appends sanitized record to clearscan_history_v1
    end
```

---

## 6. Risk Scoring Methodology

ClearScan computes a deterministic risk score bounded strictly between **0 and 100**, with the special value **-1** reserved for unanalyzable inputs.

### Risk Classifications

| Score Range | Classification | System Meaning & Context |
| :---: | :---: | :--- |
| **0 – 24** | `LOW_RISK` | No warning patterns were detected in the checks that ran. **This is not proof of safety.** |
| **25 – 49** | `MODERATE_RISK` | Some unusual characteristics were identified (e.g., URL shortener, brand lookalike, suspicious path terms). Verify official channels before proceeding. |
| **50 – 74** | `HIGH_RISK` | Multiple or stronger suspicious indicators were detected (e.g., unencrypted HTTP combined with banking keywords and suspicious TLDs). Do not interact. |
| **75 – 100** | `CRITICAL_RISK` | A confirmed threat intelligence match or critical risk condition was reported. Website should be strictly avoided. |
| **-1** | `UNABLE_TO_VERIFY` | The input was unsupported, invalid, targeted private/local network resources, or a required analysis failed. Extra caution required. |

### The Weighted Scoring Formula

Rather than simply summing check values (which causes score inflation) or averaging them (which dilutes severe warnings), ClearScan implements a **diminishing-returns weighted algorithm**:

$$\text{Score} = \min\left(100, \left\lfloor C_{(1)} + 0.4 \times \sum_{i=2}^{k} C_{(i)} + 0.5 \right\rfloor\right)$$

Where:
- $C_{(1)} \ge C_{(2)} \ge \dots \ge C_{(k)}$ are the individual integer risk contributions from all failed checks, sorted in descending order.
- The highest single contributor establishes the baseline vulnerability score.
- Every additional failed check contributes **40% of its nominal weight**, reflecting compounding risk without linear runaway.
- If any check is flagged with severity `CRITICAL` (e.g., confirmed malware signature from threat intelligence), the algorithm **enforces a strict floor of 75**, guaranteeing a `CRITICAL_RISK` rating.
- If zero checks fail, the score is **0**.
- If parsing fails, the URL exceeds length bounds, or SSRF protection triggers, the score is forced to **-1** (`UNABLE_TO_VERIFY`).

### Deterministic Test Scenarios & Benchmark Scores

When external threat intelligence is unconfigured, ClearScan evaluates deterministic heuristic rules with reproducible scoring:

| Scenario | Sample Target URL | Score | Classification | Primary Indicators Detected |
| :--- | :--- | :---: | :---: | :--- |
| **Clean HTTPS** | `https://www.wikipedia.org` | **0** | `LOW_RISK` | HTTPS protocol valid; domain verified clean; no shorteners or lookalikes. |
| **Brand Lookalike** | `https://g00gle.com/login` | **41** | `MODERATE_RISK` | Leet-speak brand impersonation (35 pts) + Sensitive login path (15 pts $\times 0.4$). |
| **Obfuscated Shortener**| `https://bit.ly/sbi-urgent-update` | **26** | `MODERATE_RISK` | Known shortener domain (20 pts) + Urgent update path keyword (15 pts $\times 0.4$). |
| **High-Risk Phishing** | `http://sbi-kyc-update.xyz/verify` | **56** | `HIGH_RISK` | Brand match (30 pts) + Suspicious keywords (24 pts $\times 0.4$) + HTTP (10 pts $\times 0.4$) + `.xyz` TLD (15 pts $\times 0.4$) + Path keyword (15 pts $\times 0.4$). |
| **Private Resource** | `http://localhost:8080/secret` | **-1** | `UNABLE_TO_VERIFY` | Host rejected by local SSRF protection rules. |

> [!WARNING]
> **What the Risk Score Represents**
> The ClearScan risk score quantifies the presence of suspicious indicators and threat signals discovered by the checks performed. **It is not a mathematical probability that a site is harmless.** Attackers frequently deploy clean domains or novel infrastructure that evade heuristic rules. A score of 0 does not certify that a destination is safe.

---

## 7. Google Safe Browsing Integration

ClearScan features an optional integration with the **Google Safe Browsing Lookup API v4** (`safebrowsing.googleapis.com/v4/threatMatches:find`).

### Explicit Status Handling

ClearScan distinguishes five distinct threat intelligence states to prevent misleading safety assurances:

| Status Code | When Triggered | Security Interpretation |
| :--- | :--- | :--- |
| `NOT_CONFIGURED` | No API key supplied or `CLEARSCAN_THREAT_INTEL_ENABLED=false`. | External lookup did not execute. Local heuristics ran independently. Not a safe-list certification. |
| `CHECKED_NO_MATCH` | Query succeeded; Google reported zero matches for the requested URL. | URL is not currently listed in Google's database. Absence from the blacklist does not guarantee safety. |
| `MATCH_FOUND` | Google identified a match for `MALWARE`, `SOCIAL_ENGINEERING`, `UNWANTED_SOFTWARE`, or `POTENTIALLY_HARMFUL_APPLICATION`. | URL is an active, confirmed security threat. Score is forced to $\ge 75$ (`CRITICAL_RISK`). |
| `UNAVAILABLE` | Network failure, timeout, invalid JSON response, or rate limiting occurred during API communication. | Remote lookup failed. Local heuristics are shown independently with an advisory disclaimer. |
| `NOT_CHECKED` | Analysis was aborted earlier due to SSRF protection, invalid URL format, or unsupported protocols. | URL was never submitted to Google. |

### Architectural Security Principles

1. **Server-Side Key Isolation:** The Google Safe Browsing API key is configured exclusively on the Spring Boot backend (`GOOGLE_SAFE_BROWSING_API_KEY`). It is **never** embedded in frontend code, client builds, or version control.
2. **Conservative Legacy Mapping:** If external threat intelligence is unconfigured or unavailable, ClearScan refuses to report a legacy `SAFE` status. It maps clean heuristic results to `UNABLE_TO_VERIFY` on legacy interfaces to prevent false confidence.
3. **Bounded Timeouts:** Remote queries enforce strict timeout controls (configurable between 250 ms and 15,000 ms; default 5,000 ms) to prevent backend thread exhaustion.

---

## 8. System Architecture

ClearScan is architected as a lightweight, decoupled system consisting of a React client, a stateless Spring Boot heuristic microservice, and optional external threat intelligence.

```mermaid
graph TB
    subgraph ClientLayer ["Client Browser Sandbox (Chrome / Firefox / Safari / Edge)"]
        direction TB
        UI["React 19 + TypeScript SPA (Vite 8)"]
        Scanner["html5-qrcode Optical Engine"]
        UPIEngine["Client UPI Parser (upi.ts)"]
        FallbackEngine["Client Heuristic Engine (scanService.ts)"]
        Storage["Browser localStorage ('clearscan_history_v1')"]
        
        UI --> Scanner
        Scanner -->|"Optical Decode"| UI
        UI --> UPIEngine
        UI --> FallbackEngine
        UI <--> Storage
    end

    subgraph NetworkBoundary ["Network Transport"]
        HTTPPost["JSON over HTTPS / HTTP<br/>POST /api/scan"]
    end

    subgraph BackendLayer ["ClearScan Backend Service (Spring Boot 3.2.5 / Java 17)"]
        direction TB
        Controller["ScanController (/api/scan, /api/health)"]
        Service["UrlAnalysisService"]
        SSRF["SsrfProtection (Private IP / Localhost Guard)"]
        Scorer["RiskScoringService (Weighted Formula)"]
        
        subgraph AnalyzersModule ["Security Analyzer Suite"]
            A1["UrlValidationAnalyzer"]
            A2["SuspiciousDomainAnalyzer"]
            A3["LookalikeDomainAnalyzer"]
            A4["UrlShortenerAnalyzer"]
            A5["UrlStructureAnalyzer"]
            A6["ThreatIntelligenceAnalyzer"]
        end

        Controller --> Service
        Service --> SSRF
        Service --> AnalyzersModule
        Service --> Scorer
    end

    subgraph ExternalServices ["External Telemetry"]
        GSBAPI["Google Safe Browsing v4 API<br/>(safebrowsing.googleapis.com)"]
    end

    UI -->|"Submit Web URL"| HTTPPost
    HTTPPost --> Controller
    A6 -.->|"Optional Lookup (API Key)"| GSBAPI
```

---

## 9. Technology Stack

Every technology and dependency in the table below is verified in the project's `package.json`, `pom.xml`, and source code:

| Ecosystem | Technology / Library | Version | Role in ClearScan |
| :--- | :--- | :---: | :--- |
| **Frontend Core** | [React](https://react.dev/) | `19.3.1` | Core declarative user interface framework. |
| **Frontend Core** | [TypeScript](https://www.typescriptlang.org/) | `~7.0.2` | Static type safety and strict schema validation across the UI. |
| **Build & Tooling** | [Vite](https://vitejs.dev/) | `8.3.5` | Next-generation ESM bundler and development server. |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/) | `4.3.3` | Utility-first CSS styling with customized cybersecurity aesthetic tokens. |
| **Component Primitives**| [@base-ui/react](https://base-ui.com/) | `^1.9.0` | Accessible unstyled interface primitives. |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^1.64.0` | Clean, accessible vector icons for risk indicators and controls. |
| **Typography** | [@fontsource-variable/geist](https://fontsource.org/) | `^5.3.0` | High-legibility technical variable typography. |
| **QR Optical Engine** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) | `2.3.8` | In-browser camera QR video stream and image file matrix decoder. |
| **Backend Core** | [Java](https://openjdk.org/) | `17 LTS` | Robust enterprise programming language runtime. |
| **Backend Framework**| [Spring Boot](https://spring.io/projects/spring-boot) | `3.2.5` | Enterprise microservice framework for REST APIs and service wiring. |
| **Web & Validation** | `spring-boot-starter-web` | `3.2.5` | Spring MVC REST endpoint controllers and JSON serialization. |
| **Validation** | `spring-boot-starter-validation`| `3.2.5` | Jakarta validation constraints for incoming request payloads. |
| **Build Tool** | [Apache Maven](https://maven.apache.org/) | `3.x (Wrapper)`| Automated dependency resolution and compiler pipeline. |
| **Storage** | Browser `localStorage` | *Native* | Client-side origin-redacted audit history (`clearscan_history_v1`). |
| **External Intel** | Google Safe Browsing API | `v4` | Optional remote threat intelligence lookup for verified blacklists. |
| **Frontend Testing** | [Vitest](https://vitest.dev/) | `5.1.0` | Fast unit and integration test runner for TypeScript modules. |
| **Backend Testing** | JUnit 5 + Spring Boot Test | `5.x / 3.2.5` | MockMvc integration tests and analyzer unit test suites. |

---

## 10. API Documentation

### `POST /api/scan`

Inspects a submitted HTTP/HTTPS destination URL, executes deterministic heuristic analysis, queries optional threat intelligence, and returns a structured risk dossier.

#### Request Headers
```http
Content-Type: application/json
Accept: application/json
```

#### Request Body Schema
```json
{
  "url": "string (Required. Valid HTTP/HTTPS destination, max 2048 characters)"
}
```

#### Response Structure & Field Definitions

| Field Name | Type | Description |
| :--- | :---: | :--- |
| `url` | `string` | The normalized destination URL evaluated during analysis. |
| `status` | `string` | Legacy status flag maintained for backwards compatibility (`SAFE`, `DANGEROUS`, `UNABLE_TO_VERIFY`). |
| `message` | `string` | High-level textual summary of the evaluation outcome. |
| `normalizedHostname` | `string` | Lowercase hostname extracted from the destination URI. |
| `riskScore` | `integer` | Calculated risk index from `0` to `100`, or `-1` if unanalyzable. |
| `riskClassification` | `string` | Severity rating: `LOW_RISK`, `MODERATE_RISK`, `HIGH_RISK`, `CRITICAL_RISK`, `UNABLE_TO_VERIFY`. |
| `riskMessage` | `string` | Explanatory narrative associated with the risk classification. |
| `securityChecks` | `array` | Complete list of security checks executed, their status, individual risk contribution, and evidence. |
| `warnings` | `array` | Strings listing all warning messages generated by failed checks. |
| `recommendedAction` | `string` | Prescriptive user guidance tailored to the detected risk profile. |
| `timestamp` | `string` | ISO 8601 UTC timestamp recording when the scan executed. |
| `threatIntelligenceAvailable` | `boolean` | `true` only if Google Safe Browsing successfully executed a lookup. |
| `analysisSource` | `string` | Origin of the analysis: `BACKEND` or `LOCAL_FALLBACK`. |
| `threatIntelligenceStatus` | `string` | Status code: `NOT_CONFIGURED`, `CHECKED_NO_MATCH`, `MATCH_FOUND`, `UNAVAILABLE`, `NOT_CHECKED`. |

#### Example Request: High-Risk Phishing Scenario
```http
POST /api/scan HTTP/1.1
Host: localhost:8081
Content-Type: application/json

{
  "url": "http://sbi-kyc-update.xyz/verify"
}
```

#### Example Response (Threat Intelligence Not Configured)
```json
{
  "url": "http://sbi-kyc-update.xyz/verify",
  "status": "DANGEROUS",
  "message": "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source.",
  "normalizedHostname": "sbi-kyc-update.xyz",
  "riskScore": 56,
  "riskClassification": "HIGH_RISK",
  "riskMessage": "Multiple suspicious indicators were detected. Avoid opening this link until you verify its source.",
  "securityChecks": [
    {
      "checkName": "URL Validation",
      "passed": false,
      "riskContribution": 10,
      "riskLevel": "LOW",
      "explanation": "URL uses unencrypted HTTP instead of HTTPS. Data sent to this site is not encrypted.",
      "evidence": "Protocol: http"
    },
    {
      "checkName": "Suspicious Domain Keywords",
      "passed": false,
      "riskContribution": 24,
      "riskLevel": "MEDIUM",
      "explanation": "The domain contains keywords commonly used in phishing URLs: kyc, update.",
      "evidence": "Domain: sbi-kyc-update.xyz"
    },
    {
      "checkName": "Suspicious TLD",
      "passed": false,
      "riskContribution": 15,
      "riskLevel": "MEDIUM",
      "explanation": "The domain uses the \".xyz\" top-level domain, which is frequently associated with malicious websites.",
      "evidence": "TLD: .xyz"
    },
    {
      "checkName": "Possible Brand Impersonation",
      "passed": false,
      "riskContribution": 30,
      "riskLevel": "HIGH",
      "explanation": "The domain contains \"sbi\" but does not match any known official sbi domain. This could be an impersonation attempt.",
      "evidence": "Domain: sbi-kyc-update.xyz | Official: sbi.co.in, onlinesbi.sbi"
    },
    {
      "checkName": "URL Shortener Detection",
      "passed": true,
      "riskContribution": 0,
      "riskLevel": "LOW",
      "explanation": "This URL does not use a known URL-shortening service.",
      "evidence": ""
    },
    {
      "checkName": "Suspicious Path Keywords",
      "passed": false,
      "riskContribution": 15,
      "riskLevel": "MEDIUM",
      "explanation": "The URL path contains sensitive keywords often used in phishing pages: verify.",
      "evidence": "Path: /verify"
    },
    {
      "checkName": "Threat Intelligence",
      "passed": false,
      "riskContribution": 0,
      "riskLevel": "INFO",
      "explanation": "Google Safe Browsing was not checked because it is not configured. Local URL heuristics still ran; this is not a safe-list check.",
      "evidence": "Service: Not configured"
    }
  ],
  "warnings": [
    "URL uses unencrypted HTTP instead of HTTPS. Data sent to this site is not encrypted.",
    "The domain contains keywords commonly used in phishing URLs: kyc, update.",
    "The domain uses the \".xyz\" top-level domain, which is frequently associated with malicious websites.",
    "The domain contains \"sbi\" but does not match any known official sbi domain. This could be an impersonation attempt.",
    "The URL path contains sensitive keywords often used in phishing pages: verify."
  ],
  "recommendedAction": "Avoid opening this link. Multiple suspicious indicators were detected. Verify the source through trusted channels.",
  "timestamp": "2026-11-15T12:20:00.000Z",
  "threatIntelligenceAvailable": false,
  "analysisSource": "BACKEND",
  "threatIntelligenceStatus": "NOT_CONFIGURED"
}
```

### `GET /api/health`
- **Purpose:** Simple health probe for container orchestration, monitoring, and startup readiness.
- **Response:** `200 OK` (`"ClearScan backend is running"`).

---

## 11. Project Folder Structure

```
clearscan/
├── .gitignore                      # Git exclusion rules
├── index.html                      # HTML5 single-page application entrypoint
├── package.json                    # Frontend dependencies, build & test scripts
├── tsconfig.json                   # TypeScript project references
├── vite.config.ts                  # Vite configuration & plugin wiring
│
├── backend/                        # Spring Boot 3.2.5 Java 17 Backend
│   ├── mvnw / mvnw.cmd             # Maven Wrapper scripts (POSIX & Windows)
│   ├── pom.xml                     # Maven configuration & Spring Boot starters
│   └── src/
│       ├── main/
│       │   ├── java/com/clearscan/backend/
│       │   │   ├── BackendApplication.java       # Spring Boot main application class
│       │   │   ├── analyzer/                     # Security analyzer implementations
│       │   │   │   ├── LookalikeDomainAnalyzer.java
│       │   │   │   ├── SecurityAnalyzer.java     # Analyzer contract interface
│       │   │   │   ├── SuspiciousDomainAnalyzer.java
│       │   │   │   ├── ThreatIntelligenceAnalyzer.java # Safe Browsing v4 integration
│       │   │   │   ├── UrlShortenerAnalyzer.java
│       │   │   │   ├── UrlStructureAnalyzer.java
│       │   │   │   └── UrlValidationAnalyzer.java
│       │   │   ├── config/                       # Spring configurations (CORS, RestClient)
│       │   │   ├── controller/                   # REST controller (ScanController.java)
│       │   │   ├── dto/                          # ScanRequest & ScanResponse data transfer objects
│       │   │   ├── exception/                    # Global exception handling & validation advice
│       │   │   ├── model/                        # Domain models (RiskClassification, SecurityCheckResult)
│       │   │   ├── security/                     # SSRF protection & private IP filter (SsrfProtection.java)
│       │   │   └── service/                      # Core services (UrlAnalysisService, RiskScoringService)
│       │   └── resources/
│       │       └── application.properties        # Backend configuration & environment properties
│       └── test/java/com/clearscan/backend/      # Backend test suite (JUnit 5, MockMvc)
│
├── docs/                           # Documentation assets
│   └── screenshots/                # Authentic captured application screenshots
│       ├── homepage-desktop.png
│       ├── homepage-mobile.png
│       ├── homepage-tablet.png
│       ├── qr-scanner.png
│       ├── qr-image-upload.png
│       ├── url-analysis.png
│       ├── security-report.png
│       ├── upi-analysis.png
│       ├── scan-history.png
│       └── safety-education.png
│
└── src/                            # Frontend Source Code (React 19 + TypeScript)
    ├── App.tsx                     # Main layout shell, routing state & scan handlers
    ├── index.css                   # Global Tailwind CSS directives & color tokens
    ├── main.tsx                    # React DOM root hydration
    ├── components/                 # Reusable UI components
    │   ├── ActivityChart.tsx       # 7-day scan trend visualization
    │   ├── DashboardCard.tsx       # Metric cards (Total, Needs Review, Low Risk)
    │   ├── Footer.tsx              # Application footer & privacy disclosure drawer
    │   ├── Navbar.tsx              # Top navigation bar with active badges
    │   ├── RiskMeter.tsx           # Gauge component rendering 0-100 score & classification
    │   ├── SecurityCheckItem.tsx   # Expandable check result row with evidence pills
    │   ├── SecurityReport.tsx      # Comprehensive security analysis report modal dossier
    │   ├── Sidebar.tsx             # Desktop navigation rail
    │   └── URLInput.tsx            # URL entry form with quick presets & client validation
    ├── data/                       # Curated security educational topics & quiz questions
    ├── hooks/                      # Custom hooks (useScanHistory.ts for localStorage state)
    ├── pages/                      # Application route views
    │   ├── AboutPage.tsx           # System architecture, privacy model & credentials
    │   ├── Dashboard.tsx           # Central review hub with stats, chart & quick inputs
    │   ├── HelpPage.tsx            # Security knowledge base & interactive safety quiz
    │   ├── HistoryPage.tsx         # Filterable audit table with CSV export
    │   ├── ReportsPage.tsx         # Historical dossier archive & filtering
    │   └── ScannerPage.tsx         # Camera QR stream, image upload & UPI modal viewer
    ├── services/                   # Network services & client-side fallback engine (scanService.ts)
    ├── types/                      # TypeScript type definitions (scan.ts)
    └── utils/                      # Utilities (historyPrivacy.ts, upi.ts, validation.ts)
```

---

## 12. Application Screenshot Gallery

*All screenshots below are authentic captures of the running ClearScan application rendered at production resolutions.*

### Primary Application Interface Figures

#### Figure 1: ClearScan Main Dashboard
![Figure 1: ClearScan Main Dashboard](docs/screenshots/dashboard.jpg)
*Central Dashboard displaying overall scan statistics (Total scans, Needs review, Low-risk results), a 7-day scan activity graph, the quick URL inspection input, and the optical QR scanner launcher.*

<br/>

#### Figure 2: Scan History & Audit Log
![Figure 2: Scan History & Audit Log](docs/screenshots/scan-history.png)
*Chronological scan audit log displaying inspected URLs, scan type (QR Code or Link), timestamps, calculated risk scores, status tags (Dangerous / Low Risk), individual view actions, and export controls.*

<br/>

#### Figure 3: Security Reports & Analytics
![Figure 3: Security Reports & Analytics](docs/screenshots/reports-analytics.png)
*Comprehensive security analytics overview presenting total scan volume metrics, safe link ratios, flagged threats, historical scan trends, and a visual risk distribution donut chart (Safe vs. Dangerous).*

<br/>

#### Figure 4: QR Scanner & Destination Inspector
![Figure 4: QR Scanner & Destination Inspector](docs/screenshots/qr-scanner.png)
*Optical scanning view featuring the in-browser QR detection reticle with alignment brackets, live camera activation control, and the local image file upload option.*

<br/>

---

### Supplementary Verification Views

| Comprehensive Security Report Dossier (1440 × 1000) | UPI Payment QR Inspection Modal (1440 × 1000) |
| :---: | :---: |
| ![Security Analysis Report](docs/screenshots/security-report.png) | ![UPI QR Analysis](docs/screenshots/upi-analysis.png) |
| *Deep-dive dossier displaying the Risk Meter (Score 56 - High Risk), security checks, concrete evidence strings, and recommended defensive actions.* | *In-browser parsed UPI parameters (Payee Name, VPA, Amount) accompanied by an explicit unverified recipient identity warning.* |

| Educational Topics & Interactive Safety Quiz (1440 × 1000) | Responsive Tablet View (768 × 1024) |
| :---: | :---: |
| ![Safety Education & Quiz](docs/screenshots/safety-education.png) | ![ClearScan Tablet View](docs/screenshots/homepage-tablet.png) |
| *Interactive security learning module reinforcing quishing, typosquatting, and payment scam awareness with immediate quiz feedback.* | *Responsive tablet layout verifying flexible column stacking with zero horizontal overflow.* |

| Responsive Mobile View (390 × 844) | QR Image Upload Zone (1440 × 1000) |
| :---: | :---: |
| ![ClearScan Mobile View](docs/screenshots/homepage-mobile.png) | ![QR Image Upload](docs/screenshots/qr-image-upload.png) |
| *Mobile viewport layout showing touch-optimized action targets and collapsible mobile navigation.* | *Dedicated QR image upload interface supporting PNG, JPEG, and WEBP files up to 10 MB.* |

---

## 13. Privacy and Security Boundaries

ClearScan adheres to a strict privacy and security boundary:

1. **Client-Side Optical Decoding:** Camera video streams and uploaded QR images are processed entirely in browser memory by `html5-qrcode`. Image pixels are **never** transmitted to any server.
2. **Client-Side UPI Isolation:** Payloads matching the `upi://pay` protocol are parsed locally in the browser (`upi.ts`). Financial parameters (VPA, Payee Name, Amount) are **never** sent to the URL scanning API or logged to external endpoints.
3. **Restricted API Scope:** Only web URLs (`http://`, `https://`) are transmitted to the `/api/scan` endpoint. Non-web schemas are rejected on the client.
4. **Zero-Execution Guarantee:** ClearScan **never** initiates outbound connections to destination web servers. It does not load remote HTML, resolve external DNS records, execute client scripts, or follow HTTP 3xx redirect chains. This completely neutralizes drive-by downloads, exploit kits, and DNS rebinding attacks.
5. **SSRF Mitigation:** The backend incorporates rigorous address filtering (`SsrfProtection.java`). Any URL attempting to resolve to localhost (`127.0.0.1`, `::1`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local spaces (`169.254.0.0/16`), or cloud metadata endpoints (`metadata.google.internal`) is rejected with `UNABLE_TO_VERIFY`.
6. **Origin-Sanitized Audit Logging:** Browser history retains only sanitized URL origins. Query parameters, fragments, and sensitive embedded credentials (`https://user:pass@...`) are stripped prior to storage in `localStorage`. Users can purge stored history at any time.

---

## 14. Implemented vs Planned Features

| Feature Capability | Status | Implementation Details |
| :--- | :---: | :--- |
| **Camera-Based QR Scanner** | ✅ Implemented | Live video stream decoding via `html5-qrcode`; camera stays inactive until initiated. |
| **QR Image Upload** | ✅ Implemented | File dropzone handling PNG, JPEG, WEBP files up to 10 MB in browser memory. |
| **Manual URL Analysis** | ✅ Implemented | Full URL structure, scheme normalization, and preset demonstration scenarios. |
| **URL Heuristic Suite** | ✅ Implemented | 5 deterministic analyzers: validation, keywords, TLDs, lookalikes, structure. |
| **Weighted Risk Scoring** | ✅ Implemented | Diminishing-returns formula producing 0–100 scores and 5 risk classifications. |
| **UPI QR Payload Parser** | ✅ Implemented | Extracts VPA, Payee Name, Amount, Currency with unverified recipient warnings. |
| **Local Heuristic Fallback**| ✅ Implemented | Browser mirrors backend rules when the backend server is unreachable. |
| **Privacy-Conscious History**| ✅ Implemented | LocalStorage-backed history with credential stripping, filtering, and export. |
| **Security Education & Quiz**| ✅ Implemented | Modular threat topics (Quishing, Typosquatting, UPI) with interactive quiz scoring. |
| **Google Safe Browsing v4** | ⚙️ Config-Dependent | Functional via backend `RestClient`; requires valid `GOOGLE_SAFE_BROWSING_API_KEY`. |
| **Short-Link Redirect Unwinding** | ❌ Not Implemented | Redirects are not followed to protect the backend from executing malicious routes. |
| **Merchant / Payee Identity Verification** | ❌ Not Implemented | Banking API verification of UPI VPA owners requires licensed banking aggregators. |
| **Real SMS / Message Analyzer** | ❌ Not Implemented | Message scanning is not implemented as an active analyzer in this version. |
| **User Accounts & Cloud Sync** | ❌ Not Implemented | No database or authentication system exists; state is strictly browser-local. |

---

## 15. Limitations and Responsible Use

- **Heuristic Indicators $\ne$ Safety Certification:** A score of 0 or a `LOW_RISK` classification indicates that no suspicious patterns matched existing rules. It does not certify that a website is benign or free of zero-day exploits.
- **Novel Threats & Evasion:** Sophisticated attackers frequently register legitimate generic domains (e.g., `.com` or `.org`) with clean histories that bypass heuristic filters.
- **False Positives:** Legitimate enterprise domains with long tracking parameters or unusual subdomain hierarchies may receive elevated risk scores.
- **No Redirect Chain Execution:** Shortened links (`bit.ly`, `tinyurl.com`) are flagged as unverified shorteners rather than dereferenced. Attackers can conceal malicious targets behind multiple redirect hops.
- **UPI Recipient Legitimacy:** ClearScan verifies the syntactic integrity of `upi://pay` strings but cannot confirm whether the payee name matches a registered corporate entity.

---

## 16. Installation and Local Setup

### System Prerequisites
- **Node.js:** v18.x or v20.x (tested up to Node v24)
- **Package Manager:** npm v9+
- **Java Development Kit (JDK):** Java 17 LTS (or modern OpenJDK runtime targeting Java 17)

### 1. Clone the Repository
```sh
git clone https://github.com/shamlirane06/clearscan.git
cd clearscan
```

### 2. Frontend Setup
```sh
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend interface will launch at **`http://localhost:5173`**.

### 3. Backend Setup
In a separate terminal:
```sh
cd backend

# On Linux / macOS:
./mvnw spring-boot:run

# On Windows PowerShell:
.\mvnw.cmd spring-boot:run
```
The Spring Boot server starts on port **`8081`** (API accessible at `http://localhost:8081/api`).

### 4. Optional: Enable Google Safe Browsing v4
To activate external threat intelligence lookups, configure environment variables before starting the backend:

#### Linux / macOS
```sh
export GOOGLE_SAFE_BROWSING_API_KEY="your_actual_api_key_here"
export CLEARSCAN_THREAT_INTEL_ENABLED="true"
cd backend && ./mvnw spring-boot:run
```

#### Windows PowerShell
```powershell
$env:GOOGLE_SAFE_BROWSING_API_KEY = "your_actual_api_key_here"
$env:CLEARSCAN_THREAT_INTEL_ENABLED = "true"
cd backend
.\mvnw.cmd spring-boot:run
```

*If threat intelligence is not configured, ClearScan automatically operates in local heuristic mode, explicitly reporting `NOT_CONFIGURED` without impacting local URL checks.*

---

## 17. Testing and Quality Assurance

ClearScan includes comprehensive test suites across both frontend TypeScript components and backend Spring Boot services.

### Running Frontend Tests
```sh
npm test
```

**Verified Test Results (Vitest 5.1.0):**
- **Test Files:** 10 passed (`10/10`)
- **Total Tests:** 50 passed (`50/50`)
- **Test Coverage:**
  - `src/services/scanService.test.ts` (10 tests: network failure fallback, schema guards, SSRF host blocks)
  - `src/utils/validation.test.ts` (9 tests: protocol normalization, URL regex, credential checks)
  - `src/pages/ScannerPage.test.ts` (7 tests: camera states, QR payload routing, plain-text handling)
  - `src/pages/HistoryPage.test.ts` (5 tests: filter logic, search, deletion, date ranges)
  - `src/pages/HelpPage.test.ts` (5 tests: search filtering, accordion interactions, quiz evaluation)
  - `src/pages/ReportsPage.test.ts` (4 tests: range filtering, risk classification groupings)
  - `src/utils/upi.test.ts` (4 tests: payload parameter extraction, VPA parsing, currency validation)
  - `src/utils/historyPrivacy.test.ts` (3 tests: credential stripping, origin sanitization)
  - `src/pages/Dashboard.test.ts` (2 tests: stats aggregation, activity trends)
  - `src/hooks/useScanHistory.test.ts` (1 test: localStorage persistence and state management)

### Building for Production
```sh
npm run build
```
Compiles TypeScript with `tsc -b` and builds production client assets via Vite.

### Running Backend Tests
```sh
cd backend

# On Linux / macOS:
./mvnw test

# On Windows PowerShell:
.\mvnw.cmd test
```

**Verified Backend Test Suites:**
- **`ScanControllerIntegrationTest`:** End-to-end MockMvc testing across `POST /api/scan` for safe samples, synthetic phishing, private hosts, and UPI rejection.
- **`UrlAnalysisServiceTest`:** 13 unit tests verifying deterministic scoring, SSRF rejection, TLD analysis, and lookalike detection.
- **`SsrfProtectionTest`:** Comprehensive boundary validation blocking private IPv4 ranges, loopbacks, link-local addresses, and IPv4-mapped IPv6 literals.
- **`LookalikeDomainAnalyzerTest`:** Brand normalization, leet-speak substitution, and Punycode homoglyph checks.
- **`ThreatIntelligenceAnalyzerTest`:** Graceful fallback across `NOT_CONFIGURED`, `UNAVAILABLE`, and `MATCH_FOUND` outcomes.
- **`RiskScoringServiceTest`:** Verifies diminishing-returns calculations and critical score floors.

---

## 18. Hackathon Demonstration Guide

Follow this structured demonstration script during hackathon evaluations to showcase ClearScan’s capabilities:

### Step 1: Launch Application
Start the frontend (`npm run dev`) and backend (`.\mvnw.cmd spring-boot:run`). Open `http://localhost:5173`.

### Step 2: Showcase Clean Dashboard Overview
Point out the live 7-day activity graph, the local scan summary metrics, and the two primary entrypoints: URL Inspection and QR Scanner.

### Step 3: Demonstrate Normal Clean HTTPS Scan
1. In the URL Input, choose the **Google** quick link or type `https://www.wikipedia.org`.
2. Click **Analyze URL**.
3. Point out the resulting **0 / LOW_RISK** score. Emphasize that all five local heuristic checks passed, while Threat Intelligence explicitly identifies itself as `NOT_CONFIGURED` (or `CHECKED_NO_MATCH` if an API key is active).
4. Note the honest disclaimer: *"No threats were detected by the checks performed. This does not guarantee that the website is safe."*

### Step 4: Demonstrate Synthetic Phishing Scan
1. In the URL Input, enter the synthetic test URL: `http://sbi-kyc-update.xyz/verify`.
2. Click **Analyze URL**.
3. Review the generated Security Report dossier:
   - **Risk Score:** `56` (`HIGH_RISK`).
   - **Detected Indicators:** Unencrypted HTTP, sensitive keywords (`kyc`, `update`), brand impersonation (`sbi`), suspicious TLD (`.xyz`), and sensitive path keyword (`verify`).
   - **Recommended Action:** *"Avoid opening this link. Multiple suspicious indicators were detected."*
   - Emphasize that ClearScan **never connected to the destination website**.

### Step 5: Demonstrate QR Image Upload & Decoding
1. Navigate to **Scanner** via the sidebar or Dashboard card.
2. Click **Upload QR Image** and upload any sample QR code or payment QR image.
3. Show how the optical decoding executes entirely in the client without sending image files over the network.

### Step 6: Demonstrate Financial UPI QR Inspection
1. Scan or upload a synthetic UPI QR containing `upi://pay?pa=demostore@upi&pn=Demo%20Store&am=100&cu=INR`.
2. Observe the specialized **QR Payment Request Modal**:
   - Payee Name: `Demo Store`
   - UPI ID (VPA): `demostore@upi`
   - Requested Amount: `INR ₹100`
   - Explicit Warning: Recipient identity is unverified.
   - Note that **no payment application was launched and no transaction executed**.

### Step 7: Demonstrate Privacy & Audit Trail
1. Navigate to **Scan History**.
2. Show that previously scanned URLs are logged with their calculated scores and timestamps.
3. Point out that credentials were automatically stripped.
4. Demonstrate row deletion and the **Clear History** feature.

---

## 19. Future Scope

The following roadmap items represent planned architectural enhancements:

1. **Sandboxed Short-Link Dereferencing:** Implementing a secure, server-side headless unwinding proxy that executes HTTP `HEAD` requests to resolve redirection chains without executing client-side scripts.
2. **Homoglyph & OCR Visual Analysis:** Advanced computer vision algorithms to detect visual glyph collisions across Latin, Cyrillic, and Greek alphabets directly on optical camera frames.
3. **Multi-Rail Financial Parsing:** Expanding payload parsing support to international payment standards, including Pix (Brazil), PromptPay (Thailand), EPC QR (SEPA / Europe), and EMVCo merchant standards.
4. **Multilingual Safety Education:** Localizing security educational modules into regional Indian and international languages.
5. **Zero-Knowledge Encrypted Synchronization:** Optional end-to-end encrypted user accounts enabling scan history synchronization across mobile and desktop devices without exposing browsed origins to backend infrastructure.

---

## 20. Team and Acknowledgements

### Project Author
- **Shamli Rane** — *System Architecture, Frontend Design & Full-Stack Security Engineering* ([GitHub](https://github.com/shamlirane06) • [Email](mailto:shamlirane06@gmail.com))

### Acknowledgements & Open-Source Tools
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) by Minhaz for optical in-browser QR scanning capabilities.
- [Spring Boot](https://spring.io/) and the Spring Security team for robust enterprise backend foundations.
- [Lucide Icons](https://lucide.dev/) for crisp vector iconography.
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling architecture.

---

<div align="center">
  <sub>ClearScan is developed as an open-source cybersecurity project. Always practice defensive link hygiene.</sub>
</div>
