const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { resources, readResource } = require('../services/contentRepository');

const router = express.Router();
const publicResources = Object.keys(resources).filter((resource) => resource !== 'settings');
const cvFilePath = path.join(__dirname, '..', 'uploads', 'cv', 'cv.pdf');
const cvDownloadName = 'CV-Martin-Guillen.pdf';

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DigitalCV API' });
});

router.get('/cv/download', async (_req, res, next) => {
  try {
    await fs.access(cvFilePath);
    res.setHeader('Content-Type', 'application/pdf');
    return res.download(cvFilePath, cvDownloadName, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: 'CV PDF no encontrado.' });
    }

    return next(error);
  }
});

publicResources.forEach((resource) => {
  router.get(`/${resource}`, async (_req, res, next) => {
    try {
      res.json(await readResource(resource));
    } catch (error) {
      next(error);
    }
  });
});

router.get('/settings', async (_req, res, next) => {
  try {
    res.json(await readResource('settings'));
  } catch (error) {
    next(error);
  }
});

router.get('/', (_req, res) => {
  res.json({
    name: 'DigitalCV API',
    endpoints: publicResources.map((resource) => `/api/${resource}`)
  });
});

module.exports = router;
