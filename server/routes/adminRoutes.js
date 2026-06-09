const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { requireAuth, signAdminToken } = require('../middleware/authMiddleware');
const { resources, readResource, writeResource } = require('../utils/jsonStorage');

const router = express.Router();
const editableResources = Object.keys(resources);
const maxCvSizeBytes = 5 * 1024 * 1024;
const cvUploadDir = path.join(__dirname, '..', 'uploads', 'cv');
const cvPublicUrl = '/api/cv/download';
const requiredFields = {
  profile: ['name', 'role'],
  settings: ['siteTitle', 'email'],
  experience: ['company', 'position'],
  education: ['institution', 'degree'],
  skills: ['category'],
  projects: ['name', 'status'],
  achievements: ['title']
};

const cvStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdir(cvUploadDir, { recursive: true }, (error) => callback(error, cvUploadDir));
  },
  filename: (_req, _file, callback) => {
    callback(null, 'cv.pdf');
  }
});

function createBadRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function isPdfFile(file) {
  return file?.mimetype === 'application/pdf' && path.extname(file.originalname || '').toLowerCase() === '.pdf';
}

const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: maxCvSizeBytes },
  fileFilter: (_req, file, callback) => {
    if (!isPdfFile(file)) {
      return callback(createBadRequest('El archivo debe ser un PDF.'));
    }

    return callback(null, true);
  }
}).single('cv');

function isEmptyObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((entry) => {
    if (Array.isArray(entry)) return entry.length === 0;
    if (entry && typeof entry === 'object') return isEmptyObject(entry);
    return entry === '' || entry === null || entry === undefined;
  });
}

function sanitizePayload(payload) {
  if (Array.isArray(payload)) {
    return payload.filter((item) => !isEmptyObject(item));
  }

  return payload;
}

function validateUrl(value, fieldName) {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('/')) return null;

  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? null : `${fieldName} debe usar http, https o mailto.`;
  } catch (_error) {
    return `${fieldName} no es una URL valida.`;
  }
}

function collectUrlErrors(value, path = '') {
  if (!value || typeof value !== 'object') return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectUrlErrors(item, `${path}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, entry]) => {
    const currentPath = path ? `${path}.${key}` : key;
    const shouldValidate = /url$/i.test(key) || ['linkedin', 'github', 'cvPdf'].includes(key);

    if (shouldValidate && typeof entry === 'string') {
      const error = validateUrl(entry, currentPath);
      return error ? [error] : [];
    }

    return collectUrlErrors(entry, currentPath);
  });
}

function validateResource(resource, payload) {
  if (payload === null || payload === undefined) {
    return ['El contenido no puede estar vacio.'];
  }

  if (['experience', 'education', 'skills', 'projects', 'achievements'].includes(resource) && !Array.isArray(payload)) {
    return [`${resource} debe ser una lista.`];
  }

  if (['profile', 'settings'].includes(resource) && (typeof payload !== 'object' || Array.isArray(payload))) {
    return [`${resource} debe ser un objeto.`];
  }

  const required = requiredFields[resource] || [];
  const requiredErrors = [];

  if (Array.isArray(payload)) {
    payload.forEach((item, index) => {
      required.forEach((field) => {
        if (!String(item?.[field] || '').trim()) {
          requiredErrors.push(`${resource}[${index}].${field} es obligatorio.`);
        }
      });
    });
  } else {
    required.forEach((field) => {
      if (!String(payload?.[field] || '').trim()) {
        requiredErrors.push(`${field} es obligatorio.`);
      }
    });
  }

  return [...requiredErrors, ...collectUrlErrors(payload)];
}

router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPassword) {
      return res.status(500).json({ message: 'ADMIN_USER y ADMIN_PASSWORD deben estar configurados.' });
    }

    if (username !== adminUser || password !== adminPassword) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    res.json({ token: signAdminToken(username), user: { username } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { username: req.admin.username } });
});

router.post('/logout', requireAuth, (_req, res) => {
  res.json({ ok: true });
});

router.post('/settings/cv', requireAuth, (req, res, next) => {
  uploadCv(req, res, async (error) => {
    try {
      if (error) {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'El archivo no debe superar los 5 MB.' });
        }

        if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'El campo del archivo debe llamarse cv.' });
        }

        return res.status(error.status || 400).json({ message: error.message || 'No se pudo subir el CV.' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Tenes que seleccionar un archivo PDF.' });
      }

      if (!isPdfFile(req.file)) {
        return res.status(400).json({ message: 'El archivo debe ser un PDF.' });
      }

      const settings = await readResource('settings');
      const updatedSettings = {
        ...settings,
        cvFileName: 'cv.pdf',
        cvUrl: cvPublicUrl,
        cvUpdatedAt: new Date().toISOString()
      };

      res.json(await writeResource('settings', updatedSettings));
    } catch (uploadError) {
      next(uploadError);
    }
  });
});

router.get('/content', requireAuth, async (_req, res, next) => {
  try {
    const entries = await Promise.all(editableResources.map(async (resource) => [resource, await readResource(resource)]));
    res.json(Object.fromEntries(entries));
  } catch (error) {
    next(error);
  }
});

router.get('/content/:resource', requireAuth, async (req, res, next) => {
  try {
    res.json(await readResource(req.params.resource));
  } catch (error) {
    next(error);
  }
});

router.put('/content/:resource', requireAuth, async (req, res, next) => {
  try {
    const resource = req.params.resource;

    if (!editableResources.includes(resource)) {
      return res.status(404).json({ message: 'Recurso no encontrado.' });
    }

    const payload = sanitizePayload(req.body);
    const errors = validateResource(resource, payload);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Datos invalidos.', errors });
    }

    res.json(await writeResource(resource, payload));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
