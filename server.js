import express, { json } from 'express';
import { connectDatabase } from './config/db.js';
import { check } from 'express-validator';
import { validationResult } from 'express-validator';
import cors from 'cors';
import { User } from './models/Users.js';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import config  from 'config';
import auth from "./middleware/auth.js";

let app = express();

connectDatabase();

app.use(json({ extended: false }));
app.use(cors({ origin: "http://localhost:3000" }));

app.get('/', (req, res) => res.send("HTTP GET request sent to root API endpoint"));
app.post('/api/users',
    [
        check('name', "Please enter your name").not().isEmpty(),
        check('email', "Please enter a valid email").isEmail(),
        check('password', "Please enter a password with 6 or more characters").isLength({ min: 6 })
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
                const salt = await bcryptjs.genSalt(10);
                user.password = await bcryptjs.hash(password, salt);

                await user.save();

                const payload = {
                    user: { id: user.id }
                };

                jsonwebtoken.sign(
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
app.get('/api/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send("Unkown server error");
    }
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));