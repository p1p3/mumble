const { sampleTime } = require('rxjs');
const { mumbleConfig } = require('../config/mumble.js');
const tcp = require('./tcp_server.js');
// const trackingRepository = require('./tracking.repository.js');

(async () => {
  try {
    // tracking, but we don't want to send any messages yet
    const tracking$ = await tcp.createTCPServer({ port: mumbleConfig.tracking.port });
    // const repo = await trackingRepository.create(mumbleConfig.couchDb.url);

    tracking$
      .pipe(sampleTime(100))
      .subscribe((data) => console.log('data received tracking', data));

    const potential$ = await tcp.createTCPServer({ port: mumbleConfig.potential.port });

    potential$
      .pipe(sampleTime(100))
      .subscribe((data) => console.log('data received potential', data));
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
