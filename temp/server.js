const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files (HTML, JS, etc.) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Read SSL certificate and key files
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const port = process.env.PORT || 3000;
https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
