const AnalyticsEvent = require('../models/AnalyticsEvent');
const { requireMongoConnection } = require('../config/mongodb');

const maxEvents = 3000;

function cleanDocument(document) {
  const event = document.toObject ? document.toObject() : document;
  delete event._id;
  return event;
}

async function trimOldEvents() {
  const count = await AnalyticsEvent.estimatedDocumentCount();
  const extra = count - maxEvents;

  if (extra <= 0) return;

  const oldEvents = await AnalyticsEvent.find({})
    .sort({ createdAt: 1 })
    .limit(extra)
    .select('_id')
    .lean();

  if (oldEvents.length > 0) {
    await AnalyticsEvent.deleteMany({ _id: { $in: oldEvents.map((event) => event._id) } });
  }
}

async function createEvent(event) {
  requireMongoConnection();
  await AnalyticsEvent.create(event);
  await trimOldEvents();
  return event;
}

async function readEvents() {
  requireMongoConnection();
  const events = await AnalyticsEvent.find({}).sort({ createdAt: 1 }).lean();
  return events.map(cleanDocument);
}

async function readRecentEvents(limit) {
  requireMongoConnection();
  const events = await AnalyticsEvent.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return events.map(cleanDocument);
}

module.exports = {
  createEvent,
  maxEvents,
  readEvents,
  readRecentEvents
};
