const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Read self-signed certificates from "certs" folder
const options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem')
};

// Bind server to 0.0.0.0 so it's accessible on your LAN
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server running at https://<your-local-ip>:${PORT}`);
});
