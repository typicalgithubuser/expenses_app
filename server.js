const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const USERS_DB = './users.db';
const EXPENSES_DB = './expenses.db';

const encrypt = (text) => crypto.createHash('sha256').update(text).digest('hex');

const readDb = (path) => {
    if (!fs.existsSync(path)) return [];
    try { return JSON.parse(fs.readFileSync(path, 'utf8')); } 
    catch (e) { return []; }
};

const writeDb = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, 2));

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const users = readDb(USERS_DB);
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'існує' });
    users.push({ username, password: encrypt(password) });
    writeDb(USERS_DB, users);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readDb(USERS_DB);
    const user = users.find(u => u.username === username && u.password === encrypt(password));
    if (user) res.json({ success: true });
    else res.status(401).json({ error: 'невірно' });
});

app.get('/api/expenses/:user', (req, res) => {
    const expenses = readDb(EXPENSES_DB);
    res.json(expenses.filter(e => e.user === req.params.user));
});

app.post('/api/expenses', (req, res) => {
    const expenses = readDb(EXPENSES_DB);
    expenses.push(req.body);
    writeDb(EXPENSES_DB, expenses);
    res.json({ success: true });
});

app.listen(3000, () => console.log('сервер запущено на порті: 3000'));