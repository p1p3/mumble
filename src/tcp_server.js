const { map, bindCallback, sampleTime } = require('rxjs');
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
  function handleConnection(conn) {
    const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;
    console.log('new client connection from %s', remoteAddress);

    const onDataAsObservable = bindCallback((cb) => conn.on('data', cb));
    const data$ = onDataAsObservable().pipe(
      sampleTime(500),
      map((d) => {
        const decoder = new StringDecoder();

        // Decode received string
        const stream = decoder.write(d);
        return splitJson(stream);
      }),
    );

    const onCloseAsObservable = bindCallback((cb) => conn.on('close', cb));
    const close$ = onCloseAsObservable();

    const onErrorObservable = bindCallback((cb) => conn.on('error', cb));
    const error$ = onErrorObservable();

    return { data$, close$, error$ };
  }

  const server = net.createServer();

  return new Promise((resolve) => {
    server.on('connection', (connection) => {
      resolve(handleConnection(connection));
    });

    server.listen(port, () => {
      console.log('server listening to %j', server.address());
    });
  });
};
