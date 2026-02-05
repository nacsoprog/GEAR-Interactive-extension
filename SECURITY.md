# Security Policy

## Supported Versions

Only the latest version of the extension published on the Chrome Web Store is currently supported.

| Version | Supported          |
| ------- | ------------------ |
| v1.3.x  | :white_check_mark: |
| < 1.2.0 | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in GEAR Interactive, please report it privately. Do **NOT** open a public GitHub issue for security concerns.

**How to report:**
Contact me directly ([nacsoprog](https://github.com/nacsoprog))

## Security Measures Implemented

To ensure the safety of UCSB students' data, GEAR Interactive implements the following strict security measures:

### 1. Minimal Privileges

- **Host Permissions**: Restricted strictly to 5 specific `my.sa.ucsb.edu` pages required for functionality.
- **API Access**: No `cookies`, `webRequest`, or `management` permissions.

### 2. Content Security Policy (CSP)

- **Script Execution**: Strict adherence to Manifest V3's default CSP, with additional restrictions on object-src to prevent any unauthorized plugin execution
- **Resource Loading**: `img-src 'self'` blocks all external tracking pixels and images.
- **Eval**: `unsafe-eval` is NOT allowed, blocking code strings from being executed.

### 3. Input Sanitization

- All data scraped from GOLD is inserted into the DOM using `innerText` or `textContent`.
- **No usage of `innerHTML`** with untrusted data to prevent XSS attacks.

### 4. Dependency Management

- All dependencies in `package.json` are **version-pinned** (no `^` or `~`) to prevent malicious updates from auto-installing.
- `npm audit` is run before every release.

### 5. Data Privacy

- **Local Storage**: Data is stored locally and synced across your devices via Google's secure sync infrastructure. No data is stored on external non-Google servers.
- **No Analytics**: The extension contains no tracking scripts, analytics, or telemetry.
- **No Exfiltration**: The extension has no server-side component and makes no network requests to third-party servers.
