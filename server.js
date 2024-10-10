const express = require('express');
const db = require('./config/db');
const check = require('express-validator').check;
const validationResult = require('express-validator').validationResult;
const cors = require('cors');
const User = require('./models/Users').User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

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
    async (req, res) => 
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
        else
        {
            const { name, email, password } = req.body;

            try
            {
                let user = await User.findOne({ email: email});

                if (user)
                {
                    return res.status(400).json({ errors: [{ msg: "User already exists" }] });
                }

                user = new User({ name: name, email: email, password: password });
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);

                await user.save();

                const payload = {
                    user: { id: user.id }
                };

                jwt.sign(
                    payload,
                    config.get('jwtSecret'),
                    { expiresIn: '10hr' },
                    (err, token) =>
                    {
                        if (err) throw err;
                        res.json({ token: token })
                    }
                );

            } catch (error)
            {
                res.status(500).send("Server error");
            }
        }
    }
);

const PORT = 5000;
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));