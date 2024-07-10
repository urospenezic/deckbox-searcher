const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');

const app = express();
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
        ...req.headers, //pass in headers
        host: new URL(url).hostname,
      },
    };

    //send request
    const proxyRes = await new Promise((resolve, reject) => {
      const proxyReq = protocol.request(url, options, (response) => {
        resolve(response);
      });

      proxyReq.on('error', (err) => {
        reject(err);
      });
      if (req.body && Object.keys(req.body).length > 0) {
        proxyReq.write(JSON.stringify(req.body));
      }

      proxyReq.end();
    });

    res.status(proxyRes.statusCode);
    for (const key in proxyRes.headers) {
      res.setHeader(key, proxyRes.headers[key]);
    }

    //response
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