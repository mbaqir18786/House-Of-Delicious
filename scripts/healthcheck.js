const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';

const options = {
  host: HOST,
  port: PORT,
  path: '/health',
  timeout: 3000
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`[HealthCheck] OK (HTTP 200) — ${data.trim()}`);
      process.exit(0);
    } else {
      console.error(`[HealthCheck] FAILED with status code: ${res.statusCode}`);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`[HealthCheck] ERROR: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('[HealthCheck] TIMEOUT');
  req.destroy();
  process.exit(1);
});

req.end();
