const nano = require('nano');

const getPotentialTable = async (couchServerUl) => {
  const tableName = 'potential';
  const nanoServer = nano(couchServerUl);
  const dbs = await nanoServer.db.list();

  if (!dbs.includes(tableName)) {
    nanoServer.db.create(tableName);
  }

  return nanoServer.db.use(tableName);
};

exports.create = async (couchServerUl) => {
  const trackingTable = await getPotentialTable(couchServerUl);

  const add = async (record) => trackingTable.insert(record);

  return { add };
};
