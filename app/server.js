const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const CLICKSTACK_API_KEY = process.env.CLICKSTACK_API_KEY || '';

// Inject API key into app.js BEFORE serving static files
app.get('/js/app.js', (req, res) => {
  const jsPath = path.join(__dirname, 'public', 'js', 'app.js');
  let js = fs.readFileSync(jsPath, 'utf8');
  
  // Inject API key
  js = js.replace(
    'window.CLICKSTACK_API_KEY || \'YOUR_API_KEY_HERE\'',
    `'${CLICKSTACK_API_KEY}'`
  );
  
  res.setHeader('Content-Type', 'application/javascript');
  res.send(js);
});

// Serve other static files AFTER the app.js route
app.use(express.static('public'));

// API endpoints
app.get('/api/user-profile', (req, res) => {
  console.log('GET /api/user-profile');
  res.json({
    id: 'user-123',
    name: 'Demo User',
    email: 'demo@clickhouse.com'
  });
});

app.post('/api/checkout', (req, res) => {
  console.log('POST /api/checkout');
  
  if (Math.random() > 0.5) {
    res.status(500).json({
      error: 'Payment processing failed',
      message: 'Internal server error'
    });
  } else {
    res.json({
      orderId: Math.random().toString(36).substr(2, 9),
      status: 'success',
      message: 'Order placed successfully'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo app running on http://localhost:${PORT}`);
  console.log(`Using ClickStack API Key: ${CLICKSTACK_API_KEY ? '****' + CLICKSTACK_API_KEY.slice(-4) : 'NOT SET'}`);
});