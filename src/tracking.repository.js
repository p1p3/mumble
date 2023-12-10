const nano = require('nano');

const getTrackingTable = async (couchServerUl) => {
  const tableName = 'tracking';
  const nanoServer = nano(couchServerUl);
  const trackingTable = await nanoServer.db.get(tableName);

  if (!trackingTable) {
    nanoServer.db.create(tableName);
  }

  return nanoServer.db.use(tableName);
};

exports.create = async (couchServerUl) => {
  const trackingTable = await getTrackingTable(couchServerUl);

  const add = async (record) => trackingTable.insert(record);

  return { add };
};
