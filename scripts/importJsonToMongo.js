const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const { connectMongo, mongoose } = require('../server/config/mongodb');
const ContentResource = require('../server/models/ContentResource');
const AnalyticsEvent = require('../server/models/AnalyticsEvent');
const { resources } = require('../server/services/contentRepository');
const { readJsonFile } = require('../server/utils/jsonStorage');

const overwrite = process.argv.includes('--force');

async function importContent() {
  const results = [];

  for (const resource of Object.keys(resources)) {
    const value = await readJsonFile(resources[resource]);
    const update = overwrite
      ? { $set: { resource, value } }
      : { $setOnInsert: { resource, value } };

    const result = await ContentResource.updateOne({ resource }, update, { upsert: true, runValidators: true });
    results.push({
      resource,
      action: result.upsertedCount ? 'inserted' : overwrite ? 'updated' : 'skipped'
    });
  }

  return results;
}

async function importAnalytics() {
  let events;

  try {
    events = await readJsonFile(path.join('analytics', 'events.json'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { total: 0, insertedOrUpdated: 0, skipped: true };
    }

    throw error;
  }

  const safeEvents = Array.isArray(events) ? events.filter((event) => event?.id) : [];

  if (safeEvents.length === 0) {
    return { total: 0, insertedOrUpdated: 0, skipped: false };
  }

  const operations = safeEvents.map((event) => ({
    updateOne: {
      filter: { id: event.id },
      update: overwrite ? { $set: event } : { $setOnInsert: event },
      upsert: true
    }
  }));

  const result = await AnalyticsEvent.bulkWrite(operations, { ordered: false });

  return {
    total: safeEvents.length,
    insertedOrUpdated: overwrite ? result.modifiedCount + result.upsertedCount : result.upsertedCount,
    skipped: false
  };
}

async function main() {
  await connectMongo();

  const content = await importContent();
  const analytics = await importAnalytics();

  console.log('Contenido:');
  content.forEach((entry) => {
    console.log(`- ${entry.resource}: ${entry.action}`);
  });

  console.log('Analytics:');
  if (analytics.skipped) {
    console.log('- events.json no existe; no se importaron eventos.');
  } else {
    console.log(`- eventos leidos: ${analytics.total}`);
    console.log(`- eventos ${overwrite ? 'insertados/actualizados' : 'insertados'}: ${analytics.insertedOrUpdated}`);
  }
}

main()
  .catch((error) => {
    console.error('No se pudo importar JSON a MongoDB.');
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => null);
  });
