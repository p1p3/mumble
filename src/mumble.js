const { sampleTime, map, filter, zip, tap, catchError, of } = require('rxjs');
const { mumbleConfig } = require('../config/mumble.js');
const tcp = require('./tcp_server.js');
// const trackingRepository = require('./tracking.repository.js');

// tracking, but we don't want to send any messages yet
const tracking$ = tcp.createTCPServer({ port: mumbleConfig.tracking.port }).pipe(
  map((data) => JSON.parse(data[0])),
  filter((data) => !!data),
  map(({ src, timeStamp }) => ({
    timeStamp,
    mics: src.map((mic) => ({
      x: mic.x,
      y: mic.y,
      z: mic.z,
      activity: mic.activity,
    })),
  })),
  catchError((error) => {
    console.error('error tracking', error);
    return of({});
  }),
);
// const repo = await trackingRepository.create(mumbleConfig.couchDb.url);

// {timeStamp : 4572, src: [{id: 0, tag: "", x: 0.000, y: 0.000, z: 0.000, activity: 0.000}]}

const potential$ = tcp.createTCPServer({ port: mumbleConfig.potential.port }).pipe(
  map((data) => JSON.parse(data[0])),
  filter((data) => !!data),
  map(({ timeStamp, src }) => ({
    timeStamp,
    mics: src.map((mic) => ({
      x: mic.x,
      y: mic.y,
      z: mic.z,
      energy: mic.E,
    })),
  })),
  catchError((error) => {
    console.error('error potential', error);
    return of({});
  }),
);

// {timeStamp : 4572, src: { "x": 0.260, "y": 0.084, "z": 0.962, "E": 0.235 }}
zip(tracking$, potential$)
  .pipe(
    sampleTime(50),
    catchError((error) => {
      console.error('error', error);
      return of([]);
    })
  )
  .subscribe(([tracking, potential]) => console.log('data received ', tracking, potential));
