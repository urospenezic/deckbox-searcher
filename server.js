const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); // Enable CORS

// Proxy route
app.get('/proxy', async (req, res) => {
  const { url, username, password } = req.query;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'text/html',
      },
      redirect: 'error', // Prevent automatic following of redirects
    });

    if (response.ok) {
      const data = await response.text();
      res.send(data);
    } else {
      throw new Error(`HTTP status ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Catch all other routes and serve 'index.html'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
