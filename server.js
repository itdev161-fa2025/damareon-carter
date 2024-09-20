const express = require('express');

let app = express();

app.get('/', (req, res) => res.send('HTTP GET request sent to root API endpoint'));

app.listen(3000, () => console.log('Express server running on port 3000'));