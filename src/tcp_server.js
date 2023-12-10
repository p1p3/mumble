const { StringDecoder } = require('string_decoder');
const net = require('net');

/*
 * Create TCP server that receives data and sends it to clients in a loop
 */

const boundary = /}\n{/g;
const boundaryMarker = '}####{';
const marker = '####';
const splitJson = (stream) => stream.replace(boundary, boundaryMarker).split(marker);

exports.createTCPServer = ({ onData }) => {
  function handleConnection(conn) {
    const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;
    console.log('new client connection from %s', remoteAddress);

    function onConnData(d) {
      const decoder = new StringDecoder();

      // Decode received string
      const stream = decoder.write(d);

      const receivedData = splitJson(stream);
      for (const data of receivedData) {
        try {
          onData(data);
        } catch (error) {
          console.error('Error sending data: %s', error);
        }
      }
    }

    function onConnClose() {
      console.log('connection from %s closed', remoteAddress);
    }

    function onConnError(err) {
      console.log('Connection %s error: %s', remoteAddress, err.message);
    }

    conn.on('data', onConnData);
    conn.once('close', onConnClose);
    conn.on('error', onConnError);
  }

  const server = net.createServer();
  server.on('connection', handleConnection);

  return server;
};
