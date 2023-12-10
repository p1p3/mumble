const nano = require('nano');

const getTrackingTable = async (couchServerUl) => {
  const tableName = 'tracking';
  const nanoServer = nano(couchServerUl);
  const dbs = await nanoServer.db.list();

  if (!dbs.includes(tableName)) {
    await nanoServer.db.create(tableName);
  }

  return nanoServer.db.use(tableName);
};

exports.create = async (couchServerUl) => {
  const trackingTable = await getTrackingTable(couchServerUl);

  const add = async (record, id) => trackingTable.insert({ ...record, _id: id.toString() });

  return { add };
};
