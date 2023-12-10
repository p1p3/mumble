const { mumbleConfig } = require('../config/mumble.js');
const tcp = require('./tcp_server.js');
// const trackingRepository = require('./tracking.repository.js');

(async () => {
  try {
    // tracking, but we don't want to send any messages yet
    const tracking = tcp.createTCPServer({ onData: (data) => console.log('data received', data) });
    // const repo = await trackingRepository.create(mumbleConfig.couchDb.url);

    tracking.listen(mumbleConfig.tracking.port, (x) => {
      console.log('server listening to %j', x, tracking.address());
    });

    // potential
    const potential = tcp.createTCPServer(mumbleConfig.potential.port, []);
    potential.listen(mumbleConfig.potential.port, (x) => {
      console.log('server listening to %j', x, potential.address());
    });
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
