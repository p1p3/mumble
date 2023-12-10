const { sampleTime, map, filter, zip, tap, catchError, of } = require('rxjs');
const { mumbleConfig } = require('../config/mumble.js');
const tcp = require('./tcp_server.js');
// const trackingRepository = require('./tracking.repository.js');

(async () => {
  try {
    // tracking, but we don't want to send any messages yet
    const tracking$ = tcp.createTCPServer({ port: mumbleConfig.tracking.port }).pipe(
      sampleTime(500),
      tap((x) => console.log('tracking before', x)),
      map((data) => data[0]),
      filter((data) => !!data),
      tap((x) => console.log('tracking after', x)),
      map(({ src, timeStamp }) => ({
        timeStamp,
        x: src.x,
        y: src.y,
        z: src.z,
        activity: src.activity,
      }))
    );
    // const repo = await trackingRepository.create(mumbleConfig.couchDb.url);

    // {timeStamp : 4572, src: {id: 0, tag: "", x: 0.000, y: 0.000, z: 0.000, activity: 0.000}}

    const potential$ = tcp.createTCPServer({ port: mumbleConfig.potential.port }).pipe(
      sampleTime(500),
      tap((x) => console.log('potential after', x)),
      map((data) => data[0]),
      filter((data) => !!data),
      tap((x) => console.log('potential before', x)),
      map(({ timeStamp, src }) => ({
        timeStamp,
        x: src.x,
        y: src.y,
        z: src.z,
        error: src.E,
      }))
    );

    // {timeStamp : 4572, src: { "x": 0.260, "y": 0.084, "z": 0.962, "E": 0.235 }}
    zip(tracking$, potential$)
      .pipe(
        sampleTime(500),
        catchError((error) => {
          console.error('error', error);
          return of([]);
        })
      )
      .subscribe(([tracking, potential]) => console.log('data received ', tracking, potential));
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
