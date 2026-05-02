const express = require('express');
const router = express.Router();

const { handleSQL, handleXSS, handleIDOR, handleMisconfig } = require('../controllers/vuln.controller');

router.post('/search-sql', handleSQL);
router.post('/search-xss', handleXSS);
router.get('/profile', handleIDOR);
router.get('/debug-error', handleMisconfig);

module.exports = router;