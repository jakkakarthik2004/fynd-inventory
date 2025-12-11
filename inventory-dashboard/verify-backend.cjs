const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/boltic/new-table',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response Body:', data);
    if (res.statusCode === 200) {
        console.log("SUCCESS: Backend returned 200 OK");
        process.exit(0);
    } else {
        console.error("FAILURE: Backend returned non-200");
        process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  process.exit(1);
});

req.end();
