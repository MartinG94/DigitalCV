const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const resources = {
  profile: 'profile.json',
  experience: 'experience.json',
  education: 'education.json',
  skills: 'skills.json',
  projects: 'projects.json',
  achievements: 'achievements.json',
  settings: 'settings.json'
};

function resolveDataPath(fileName) {
  return path.join(dataDir, fileName);
}

async function ensureJsonFile(fileName, fallback) {
  const filePath = resolveDataPath(fileName);

  try {
    await fs.access(filePath);
  } catch (_error) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await writeJsonFile(fileName, fallback);
  }
}

async function readJsonFile(fileName) {
  const raw = await fs.readFile(resolveDataPath(fileName), 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

async function writeJsonFile(fileName, data) {
  const filePath = resolveDataPath(fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data;
}

function getResourceFile(resource) {
  return resources[resource];
}

async function readResource(resource) {
  const fileName = getResourceFile(resource);
  if (!fileName) {
    const error = new Error('Recurso no encontrado.');
    error.status = 404;
    throw error;
  }

  return readJsonFile(fileName);
}

async function writeResource(resource, data) {
  const fileName = getResourceFile(resource);
  if (!fileName) {
    const error = new Error('Recurso no encontrado.');
    error.status = 404;
    throw error;
  }

  return writeJsonFile(fileName, data);
}

module.exports = {
  dataDir,
  resources,
  ensureJsonFile,
  readJsonFile,
  writeJsonFile,
  readResource,
  writeResource
};
