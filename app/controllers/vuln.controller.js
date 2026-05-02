const db = require('../../database');
const xss = require('xss');

let isSecureModeRef;

const setSecurityMode = (ref) => {
    isSecureModeRef = ref;
};

const getCurrentUser = () => ({
    id: 3,
    username: 'bob'
});

const handleSQL = async (req, res) => {
    let query, results;
    const userId = req.body.id;
    const isSecureMode = req.app.get('isSecureMode')();

    // INPUT VALIDATION (only in secure mode)
    if (isSecureMode && (!userId || !/^\d+$/.test(userId))) {
        return res.status(200).send("Invalid user ID");
    }

    try {
        if (isSecureMode) {
            // SECURE
            query = 'SELECT * FROM users WHERE id = ?';
            [results] = await db.execute(query, [userId]);
        } else {
            // VULNERABLE
            query = `SELECT * FROM users WHERE id = ${userId}`;
            [results] = await db.query(query);
        }

        res.render('dashboard', {
            results,
            executedQuery: query,
            isSecureMode,
            vulnType: 'sql',
            lessonName: 'SQL Injection'
        });

    } catch (err) {
        res.render('dashboard', {
            error: err.message,
            isSecureMode,
            vulnType: 'sql',
            lessonName: 'SQL Injection'
        });
    }
};

const handleXSS = (req, res) => {
    const name = req.body.name;
    let xssOutput;

    const isSecureMode = req.app.get('isSecureMode')();

    if (isSecureMode) {
        // SECURE
        xssOutput = xss(name);
    } else {
        // VULNERABLE
        xssOutput = name;
    }

    res.render('dashboard', {
        xssOutput,
        isSecureMode,
        vulnType: 'xss',
        lessonName: 'Reflected XSS'
    });
};

const handleIDOR = async (req, res) => {
    const requestedId = req.query.id;

    // Simulated logged-in user *needs improve later
    const currentUser = getCurrentUser();

    const isSecureMode = req.app.get('isSecureMode')();

    try {
        if (isSecureMode) {
            // SECURE: enforce ownership
            if (parseInt(requestedId) !== currentUser.id) {
                return res.render('dashboard', {
                    error: "Access Denied: You cannot view other users' profiles.",
                    isSecureMode,
                    vulnType: 'idor',
                    lessonName: 'Broken Access Control (IDOR)'
                });
            }
        }

        // VULNERABLE: no ownership check
        const [users] = await db.execute(
            'SELECT username, bio FROM users WHERE id = ?',
            [requestedId]
        );

        res.render('dashboard', {
            profileData: users[0],
            isSecureMode,
            vulnType: 'idor',
            lessonName: 'Broken Access Control (IDOR)'
        });

    } catch (err) {
        res.render('dashboard', {
            error: err.message,
            isSecureMode,
            vulnType: 'idor',
            lessonName: 'Broken Access Control (IDOR)'
        });
    }
};

const handleMisconfig = async (req, res, next) => {
    const isSecureMode = req.app.get('isSecureMode')();

    try {
        // force error
        await db.execute('SELECT * FROM non_existent_table');
    } catch (err) {
        if (isSecureMode) {
            err.publicMessage = "An internal server error occurred.";
            return next(err);
        } else {
            return res.render('dashboard', {
                error: "Invalid user ID input.",
                isSecureMode,
                vulnType: 'misconfig',
                lessonName: 'Misconfiguration'
            });
        }
    }
};

module.exports = { handleSQL, handleXSS, handleIDOR, handleMisconfig, setSecurityMode };