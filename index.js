// api/index.js
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all requests

app.get('/fetch-url', (req, res) => {
    const url = req.query.url;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.status(500).send('Error fetching URL');
        }
    });
});

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});

