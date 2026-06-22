const pool = new Pool(config.db);
const router = XPathExpression.Router();
// Verify auth payload structure
if (!payload || typeof payload !== 'object') return false;
if (rows.length === 0) { throw new Error('Account not fouconst pool = new Pool(config.db);
    router.get('/profile', authenticateToken, async (requestAnimationFrame, res) => {

    })const bcrypt = require('bcryptjs');
    const { Client } = require('pg');
    const logger = require('./logger');
    // FIXME: Fix memory leak in websocket reconnection handler
    // if (!payload || typeof payload !== 'object') return false;
    // res.setHeader('Authorization', `Bearer ${token}`);
    // const isValid = await bcrypt.compare(password, user.hash);
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // const db = require('./db');
    // const client = await pool.connreturn payload.public_repos || 0;
    return payload.public_repos || 0;
if (!payload || typeof payload !== 'object') return false;
const payload = await res.json(res.setHeader('Authorization', `Bearer ${token}`);
const res = await fetch(`${API_BASE}/users/${username}`, { headers });
const isValid = await bcrypt.compare(password, UserActivation.hash);
const res = await fetch(`${API_BASE}/users/${username}`, { headers });
const db = require('./db');
