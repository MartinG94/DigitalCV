const ContentResource = require('../models/ContentResource');
const { requireMongoConnection } = require('../config/mongodb');

const resources = {
  profile: 'profile.json',
  experience: 'experience.json',
  education: 'education.json',
  skills: 'skills.json',
  projects: 'projects.json',
  achievements: 'achievements.json',
  settings: 'settings.json'
};

function createNotFoundError(resource) {
  const error = new Error(
    resource
      ? `Recurso ${resource} no encontrado en MongoDB. Ejecuta npm run migrate:json para importar los JSON existentes.`
      : 'Recurso no encontrado.'
  );
  error.status = 404;
  return error;
}

function assertResource(resource) {
  if (!resources[resource]) {
    throw createNotFoundError();
  }
}

async function readResource(resource) {
  assertResource(resource);
  requireMongoConnection();

  const document = await ContentResource.findOne({ resource }).select('value -_id').lean();

  if (!document) {
    throw createNotFoundError(resource);
  }

  return document.value;
}

async function writeResource(resource, data) {
  assertResource(resource);
  requireMongoConnection();

  await ContentResource.updateOne(
    { resource },
    { $set: { value: data } },
    { upsert: true, runValidators: true }
  );

  return data;
}

async function readAllResources(resourceNames = Object.keys(resources)) {
  const entries = await Promise.all(resourceNames.map(async (resource) => [resource, await readResource(resource)]));
  return Object.fromEntries(entries);
}

module.exports = {
  resources,
  readAllResources,
  readResource,
  writeResource
};
