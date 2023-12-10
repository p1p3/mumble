const { Observable } = require('rxjs');
const { StringDecoder } = require('string_decoder');
const net = require('net');

/*
 * Create TCP server that receives data and sends it to clients in a loop
 */

const boundary = /}\n{/g;
const boundaryMarker = '}####{';
const marker = '####';
const splitJson = (stream) => stream.replace(boundary, boundaryMarker).split(marker);

exports.createTCPServer = ({ port }) => {
  const server = net.createServer();

  server.listen(port, () => {
    console.log('server listening to %j', server.address());
  });

  return new Observable((subscriber) => {
    function handleConnection(conn) {
      const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;
      console.log('new client connection from %s', remoteAddress);

      conn.on('data', (data) => {
        const decoder = new StringDecoder();

        const stream = decoder.write(data);
        subscriber.next(splitJson(stream));
      });

      conn.on('close', () => console.log('Connection close'));
      conn.on('error', (error) => console.error('Connection error', error));
    }

    server.on('connection', handleConnection);
  });
};
