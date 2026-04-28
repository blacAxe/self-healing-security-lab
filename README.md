Project Title: Self-Healing (OWASP) Top 5 Security Lab.

An interactive Node.js/EJS platform demonstrating the difference between vulnerable and secure code across five major web vulnerabilities.

The Tech Stack: Node.js, Express, EJS, MySQL (Aiven Managed DB), and Bcrypt.

Vulnerability Table: | Vulnerability | Exploitation | Mitigation |
| :---               | :---          | :---         |
| SQL Injection      | ' OR 1=1 --   | Parameterized Queries |
| XSS                | Script Popups | HTML Entity Encoding |
| IDOR               | Horizontal Privilege Escalation | Ownership Validation |
| Auth Failure       | Sensitive Data Logging | Masking & Hashing |
| Security Misconfig | Stack Trace Leaks | Generic Error Handling |