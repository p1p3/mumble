const {
  sampleTime,
  map,
  filter,
  zip,
  from,
  catchError,
  of,
  switchMap,
  combineLatest,
  shareReplay,
} = require('rxjs');
const { mumbleConfig } = require('../config/mumble.js');
const tcp = require('./tcp_server.js');
const trackingRepository = require('./tracking.repository.js');
const potentialRepository = require('./potential.repository.js');

// tracking, but we don't want to send any messages yet

const trackingRepo$ = from(trackingRepository.create(mumbleConfig.couchDb.url));

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
  shareReplay(1)
);

combineLatest([trackingRepo$, tracking$])
  .pipe(
    // sampleTime(100),
    switchMap(([trackingRepo, tracking]) => from(trackingRepo.add(tracking, tracking.timeStamp))),
    catchError((error) => {
      console.error('error storing tracking', error);
      return of({});
    })
  )
  .subscribe();
// const repo = await trackingRepository.create(mumbleConfig.couchDb.url);

// {timeStamp : 4572, src: [{id: 0, tag: "", x: 0.000, y: 0.000, z: 0.000, activity: 0.000}]}

const potentialRepo$ = from(potentialRepository.create(mumbleConfig.couchDb.url));

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
  shareReplay(1)
);

combineLatest([potentialRepo$, potential$])
  .pipe(
    // sampleTime(100),
    switchMap(([potentialRepo, potential]) => from(potentialRepo.add(potential, potential.timeStamp))),
    catchError((error) => {
      console.error('error storing potential', error);
      return of({});
    })
  )
  .subscribe();

// {timeStamp : 4572, src: { "x": 0.260, "y": 0.084, "z": 0.962, "E": 0.235 }}
zip(tracking$, potential$)
  .pipe(
    sampleTime(5000),
    catchError((error) => {
      console.error('error', error);
      return of([]);
    })
  )
  .subscribe(([tracking, potential]) => console.log('data received ', tracking, potential));
