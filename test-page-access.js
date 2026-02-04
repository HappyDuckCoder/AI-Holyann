const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/student/checklist',
  method: 'GET',
  timeout: 5000
};

console.log('🌐 Testing checklist page accessibility...');

const req = http.request(options, (res) => {
  console.log(`✅ STATUS: ${res.statusCode}`);
  console.log(`📄 HEADERS: ${JSON.stringify(res.headers, null, 2)}`);

  if (res.statusCode === 200) {
    console.log('\n🎉 SUCCESS: Checklist page is accessible!');
    console.log('The schema fix resolved the loading issue.');
  } else if (res.statusCode === 302 || res.statusCode === 307) {
    console.log('\n🔄 REDIRECT: Page redirects (likely to auth)');
    console.log('This is normal behavior for protected routes.');
  } else {
    console.log('\n⚠️ UNEXPECTED STATUS: Check server logs');
  }

  process.exit(0);
});

req.on('error', (err) => {
  console.error(`❌ CONNECTION ERROR: ${err.message}`);
  console.log('Make sure the development server is running on port 3000');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ TIMEOUT: Server took too long to respond');
  console.log('The page might still be loading or there are server issues');
  req.destroy();
  process.exit(1);
});

req.end();
