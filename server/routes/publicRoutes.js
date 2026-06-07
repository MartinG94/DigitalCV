const express = require('express');
const { resources, readResource } = require('../utils/jsonStorage');

const router = express.Router();
const publicResources = Object.keys(resources).filter((resource) => resource !== 'settings');

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DigitalCV API' });
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
