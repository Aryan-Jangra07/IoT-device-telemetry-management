const net = require('net');

const client = net.createConnection({ port: 5000 }, () => {
  console.log('Backend on port 5000 is still up and running');
  client.end();
});

client.on('error', () => {
  console.log('Backend is DOWN! Nodemon might not have recovered.');
});
