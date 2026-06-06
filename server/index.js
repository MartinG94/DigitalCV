const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const clientDir = path.join(__dirname, '..', 'client');
const buildDir = path.join(__dirname, '..', 'dist', 'client');
const staticRoot = process.env.NODE_ENV === 'production' ? buildDir : path.join(clientDir, 'public');
const srcDir = process.env.NODE_ENV === 'production' ? path.join(buildDir, 'src') : path.join(clientDir, 'src');

const resources = {
  profile: 'profile.json',
  experience: 'experience.json',
  education: 'education.json',
  skills: 'skills.json',
  projects: 'projects.json',
  achievements: 'achievements.json'
};

app.use(morgan('dev'));
app.use(express.json());
const moduleStaticOptions = {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      res.type('application/javascript');
    }

    if (filePath.endsWith('.css')) {
      res.type('text/css');
    }
  }
};

app.use(express.static(staticRoot, moduleStaticOptions));
app.use('/src', express.static(srcDir, moduleStaticOptions));

async function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'DigitalCV' });
});

Object.entries(resources).forEach(([resource, fileName]) => {
  app.get(`/api/${resource}`, async (_req, res, next) => {
    try {
      res.json(await readJson(fileName));
    } catch (error) {
      next(error);
    }
  });
});

app.get('/api', (_req, res) => {
  res.json({
    name: 'DigitalCV API',
    endpoints: Object.keys(resources).map((resource) => `/api/${resource}`)
  });
});

app.get('*', async (_req, res, next) => {
  const indexPath = path.join(staticRoot, 'index.html');

  try {
    await fs.access(indexPath);
    res.sendFile(indexPath);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'No se pudo procesar la solicitud.',
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
});

app.listen(PORT, () => {
  console.log(`DigitalCV disponible en http://localhost:${PORT}`);
});
