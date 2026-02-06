# Security Policy

## Supported Versions

Only the latest version of the extension published on the Chrome Web Store is currently supported.

| Version | Supported          |
| ------- | ------------------ |
| v1.3.x  | Yes                |
| < 1.2.0 | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability in GEAR Interactive, please report it privately. Do **NOT** open a public GitHub issue for security concerns.

**How to report:**
File a report under the security tab or just email <gear.interactive.help@gmail.com>

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

- Dependencies are regularly monitored and audited for vulnerabilities.
- `npm audit` is run before every release.

### 5. Data Privacy

- **Local Storage**: Data is stored locally and synced across your devices via Google's secure sync infrastructure. No data is stored on external non-Google servers.
- **No Analytics**: The extension contains no tracking scripts, analytics, or telemetry.
- **No Exfiltration**: The extension has no server-side component and makes no network requests to third-party servers.

### 6. CRX Security

- **Private Key**: The private key used to sign the CRX file is stored securely and password protected. It is not accessible to the public.
- **No Tampering**: The CRX file is signed with this private key, which ensures that the extension can not be externally tampered with.
