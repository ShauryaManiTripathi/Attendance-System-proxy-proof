const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Bind to 0.0.0.0 to listen on LAN
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://<your-local-IP>:${PORT}`);
});
