const express = require('express');
const db = require('./config/db');

let app = express();

db.connectDatabase();

app.get('/', (req, res) => res.send('HTTP GET request sent to root API endpoint'));

app.listen(3000, () => console.log('Express server running on port 3000'));