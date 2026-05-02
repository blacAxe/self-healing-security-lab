const express = require('express');
const db = require('./database');
const bcrypt = require('bcrypt'); // Hash passwords
require('dotenv').config();

const app = express();

let isSecureMode = false;

app.use(express.static('public')); // Serve style.css
app.use(express.urlencoded({ extended: true })); // To handle form data
app.use(express.json());
app.set('view engine', 'ejs');

const authRoutes = require('./app/routes/auth.routes');
const { setSecurityMode } = require('./app/controllers/auth.controller');

const vulnRoutes = require('./app/routes/vuln.routes');
const { setSecurityMode: setVulnSecurity } = require('./app/controllers/vuln.controller');

// --- THE SECURITY TOGGLE ---
app.set('isSecureMode', () => isSecureMode);

setSecurityMode(() => isSecureMode);
setVulnSecurity(() => isSecureMode);

app.use('/', vulnRoutes);

app.use('/', authRoutes);

// A way to toggle-security
app.post('/toggle-security', (req, res) => {
    isSecureMode = !isSecureMode;
    
    // Get the previous page URL
    let backURL = req.get('referer') || '/';
    
    // If the previous URL was a POST result (like /search-sql), 
    // clean it up
    if (backURL.includes('/search-sql') || backURL.includes('/login-auth') || backURL.includes('/search-xss')) {
        backURL = '/'; 
    }
    
    res.redirect(backURL);
});

// Dashboard Route
app.get('/', async (req, res) => {
    // Determine which lesson to show based on ?vln=...
    const vulnType = req.query.vln || 'sql'; // Default is SQL
    
    // Build data objects for each lesson.
    const lessonTitles = {
        'sql': 'A03: SQL Injection',
        'xss': 'A03: Reflected XSS',
        'idor': 'A01: Broken Access Control (IDOR)',
        'auth': 'A07: Authentication Failures',
        'config': 'A05: Security Misconfiguration'
    };

    const lessonName = lessonTitles[vulnType] || 'Security Lesson';

    // Pass the vulnType to the view so it can load the right lesson partial.
    res.render('dashboard', { isSecureMode, lessonName, vulnType });
});

// Fallback for Search: Redirects back to the SQL lesson if refreshed
app.get('/search-sql', (req, res) => {
    res.redirect('/?vln=sql');
});

// Fallback for Login: Redirects back to the Auth lesson if refreshed
app.get('/login-auth', (req, res) => {
    res.redirect('/?vln=auth');
});

// Fallback for XSS: Redirects back to the XSS lesson if refreshed
app.get('/search-xss', (req, res) => {
    res.redirect('/?vln=xss');
});

app.use((err, req, res, next) => {
    const isSecureMode = typeof err.publicMessage !== "undefined";

    res.status(500).render('dashboard', {
        error: err.publicMessage || "Something went wrong",
        isSecureMode,
        vulnType: 'config',
        lessonName: 'Security Misconfiguration'
    });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // Export app for testing