const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serve static files
app.use(express.static(__dirname));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Task Management System frontend running at http://localhost:${port}`);
}); 