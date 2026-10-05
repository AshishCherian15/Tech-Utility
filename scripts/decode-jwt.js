const payload = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzY3JwZnZ2Zm54b2V6emJlZ3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjQ0OTMsImV4cCI6MjEwNjQ0MDQ5M30';

const decoded = Buffer.from(payload, 'base64').toString('utf-8');
console.log('JWT Payload:');
console.log(JSON.stringify(JSON.parse(decoded), null, 2));

const data = JSON.parse(decoded);
const now = Math.floor(Date.now() / 1000);
console.log('\nCurrent timestamp:', now);
console.log('Issued at (iat):', data.iat);
console.log('Expires at (exp):', data.exp);
console.log('Expired?', now > data.exp);
console.log('Time until expiry:', data.exp - now, 'seconds');
