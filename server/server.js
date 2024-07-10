const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');

const app = express();

// Serve static files (e.g., index.html, index.js, index.css)
app.use(express.static(path.join(__dirname, '..', '/frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

//proxy
app.use('/proxy', async (req, res) => {
  const url = req.query.url;
  console.log(`${url}`);
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const protocol = url.startsWith('https') ? https : http;
    console.log(`${req.headers} ${protocol}`);
    const options = {
      method: 'GET',
      headers: {
        ...req.headers, // Pass all headers from the frontend request
        host: new URL(url).hostname, // Set host header based on proxied URL
      },
    };

    // Make the request to the specified URL
    const proxyRes = await new Promise((resolve, reject) => {
      const proxyReq = protocol.request(url, options, (response) => {
        resolve(response);
      });

      proxyReq.on('error', (err) => {
        reject(err);
      });

      // Send request body if any
      if (req.body && Object.keys(req.body).length > 0) {
        proxyReq.write(JSON.stringify(req.body));
      }

      proxyReq.end();
    });

    // Set status and headers from the proxied response
    res.status(proxyRes.statusCode);
    for (const key in proxyRes.headers) {
      res.setHeader(key, proxyRes.headers[key]);
    }

    // Pipe the proxied response back to the client
    proxyRes.pipe(res);
  } catch (err) {
    console.error('Proxy request error:', err);
    res.status(500).send('Proxy request failed');
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});