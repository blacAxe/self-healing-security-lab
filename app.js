const express = require('express');
const db = require('./database');
const bcrypt = require('bcrypt'); // Hash passwords
require('dotenv').config();

const app = express();
app.use(express.static('public')); // Serve style.css
app.use(express.urlencoded({ extended: true })); // To handle form data
app.set('view engine', 'ejs');

// --- THE SECURITY TOGGLE ---
// In a real app, this would be in a DB, but for a demo, a global variable is fine.
let isSecureMode = false;

// A way to toggle-security
app.post('/toggle-security', (req, res) => {
    isSecureMode = !isSecureMode;
    
    // Get the previous page URL
    let backURL = req.get('referer') || '/';
    
    // If the previous URL was a POST result (like /search-sql), 
    // clean it up so we don't get stuck!
    if (backURL.includes('/search-sql') || backURL.includes('/login-auth') || backURL.includes('/search-xss')) {
        backURL = '/'; 
    }
    
    res.redirect(backURL);
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

// 0. Dashboard Route
app.get('/', async (req, res) => {
    // Determine which lesson to show based on ?vln=...
    const vulnType = req.query.vln || 'sql'; // Default is SQL
    
    // We will build data objects for each lesson.
    const lessonTitles = {
        'sql': 'A03: SQL Injection',
        'xss': 'A03: Reflected XSS',
        'idor': 'A01: Broken Access Control (IDOR)',
        'auth': 'A07: Authentication Failures',
        'config': 'A05: Security Misconfiguration'
    };

    const lessonName = lessonTitles[vulnType] || 'Security Lesson';

    // We pass the vulnType to the view so it can load the right lesson partial.
    res.render('dashboard', { isSecureMode, lessonName, vulnType });
});

// 1. Login for users
app.post('/login-auth', async (req, res) => {
    const { username, password } = req.body;
    let message = "";

    // --- THE VULNERABILITY: SENSITIVE DATA LOGGING ---
    if (isSecureMode) {
        console.log(`[AUTH] Login attempt for user: ${username} (Password masked for security)`);
    } else {
        // ❌ VULNERABLE: Logging plaintext passwords to the console/logs
        console.log(`[AUTH] DEBUG: User ${username} tried to login with password: ${password}`);
    }

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (user && password === user.password) {
            message = "✅ Login Successful!";
        } else {
            message = "❌ Invalid Credentials.";
        }

        res.render('dashboard', { 
            authMessage: message, 
            isSecureMode, 
            vulnType: 'auth', 
            lessonName: 'Authentication & Data Leakage' 
        });
    } catch (err) {
        res.render('dashboard', { error: err.message, isSecureMode, vulnType: 'auth', lessonName: 'Auth Error' });
    }

    res.render('dashboard', { 
        authMessage: message, 
        isSecureMode, 
        vulnType: 'auth', 
        lessonName: 'Authentication Failures',
        // Ensure we don't lose the sidebar state
        results: [] 
    });
});


// 2. SQL Search Route
app.post('/search-sql', async (req, res) => {
    const userId = req.body.id;
    let query, results;
    try {
        if (isSecureMode) {
            [results] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
            query = 'SELECT * FROM users WHERE id = ?';
        } else {
            query = `SELECT * FROM users WHERE id = ${userId}`;
            [results] = await db.query(query);
        }
        res.render('dashboard', { results, isSecureMode, vulnType: 'sql', lessonName: 'SQL Injection', executedQuery: query });
    } catch (err) {
        res.render('dashboard', { error: err.message, isSecureMode, vulnType: 'sql', lessonName: 'SQL Injection' });
    }
});

// 3. XSS Route
app.post('/search-xss', (req, res) => {
    const name = req.body.name;
    let xssOutput;

    if (isSecureMode) {
        // ✅ SECURE: Sanitize input by escaping HTML characters
        xssOutput = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    } else {
        // ❌ VULNERABLE: Direct reflection
        xssOutput = name;
    }

    res.render('dashboard', { 
        xssOutput, 
        isSecureMode, 
        vulnType: 'xss', 
        lessonName: 'Reflected XSS' 
    });
});

// 4. Simulate Profile Page
app.get('/profile', async (req, res) => {
    const requestedId = req.query.id;
    const currentUser = { id: 3, username: 'bob' }; // Simulate Bob being logged in

    try {
        if (isSecureMode) {
            // ✅ SECURE: Check if the logged-in user is allowed to see this ID
            if (parseInt(requestedId) !== currentUser.id) {
                return res.render('dashboard', { 
                    error: "Access Denied: You cannot view other users' profiles.", 
                    isSecureMode, vulnType: 'idor', lessonName: 'IDOR' 
                });
            }
        }

        // ❌ VULNERABLE: The app just fetches whatever ID is in the URL
        const [users] = await db.execute('SELECT username, bio FROM users WHERE id = ?', [requestedId]);
        res.render('dashboard', { 
            profileData: users[0], 
            isSecureMode, vulnType: 'idor', lessonName: 'IDOR' 
        });
        
    } catch (err) {
        res.render('dashboard', { error: err.message, isSecureMode, vulnType: 'idor', lessonName: 'IDOR' });
    }
});

app.get('/debug-error', async (req, res) => {
    try {
        // Trigger a deliberate error
        await db.execute('SELECT * FROM non_existent_table');
    } catch (err) {
        if (isSecureMode) {
            // ✅ SECURE: Generic message
            res.render('dashboard', { 
                error: "An internal server error occurred.", 
                isSecureMode, vulnType: 'config', lessonName: 'Security Misconfiguration' 
            });
        } else {
            // ❌ VULNERABLE: Full Stack Trace
            res.render('dashboard', { 
                error: err.stack, 
                isSecureMode, vulnType: 'config', lessonName: 'Security Misconfiguration' 
            });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));