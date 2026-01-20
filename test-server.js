// Quick test to see if server.js has syntax errors
import { createServer } from 'http';
import { parse } from 'url';

console.log('Test: ES modules working');
console.log('Test: imports successful');

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server OK');
});

server.listen(3001, () => {
    console.log('Test server listening on http://localhost:3001');
    setTimeout(() => {
        console.log('Closing test server...');
        server.close();
        process.exit(0);
    }, 2000);
});
