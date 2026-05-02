const db = require('../../database');
const bcrypt = require('bcrypt');

let isSecureModeRef;

// Pass reference from app.js later
const setSecurityMode = (ref) => {
    isSecureModeRef = ref;
};

const login = async (req, res) => {
    const { username, password } = req.body;
    let message = "";

    const isSecureMode = req.app.get('isSecureMode')();

    if (isSecureMode) {
        console.log(`[AUTH] Login attempt for user: ${username} (masked)`);
    } else {
        console.log(`[AUTH] DEBUG: ${username} / ${password}`);
    }

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?', 
            [username]
        );

        const user = users[0];

        if (user) {
            if (isSecureMode) {
                const match = await bcrypt.compare(password, user.password);
                message = match ? "Login Successful!" : "Invalid Credentials.";
            } else {
                message = (password === user.password)
                    ? "Login Successful!"
                    : "Invalid Credentials.";
            }
        }

        res.render('dashboard', { 
            authMessage: message, 
            isSecureMode, 
            vulnType: 'auth', 
            lessonName: 'Authentication Failures'
        });

    } catch (err) {
        res.render('dashboard', { 
            error: err.message, 
            isSecureMode, 
            vulnType: 'auth', 
            lessonName: 'Auth Error'
        });
    }
};

module.exports = { login, setSecurityMode };