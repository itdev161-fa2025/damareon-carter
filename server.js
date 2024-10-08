const express = require('express');
const db = require('./config/db');
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const cors = require('cors');

let app = express();

db.connectDatabase();

app.use(express.json({ extended: false }));
app.use(cors({ origin: "http://localhost:3000" }));

app.get('/', (req, res) => res.send('HTTP GET request sent to root API endpoint'));
app.post('/api/users',
    [
        check('name', 'Please enter your name').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    (req, res) => 
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        else res.send(req.body);
    }
);

const PORT = 5000;
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));