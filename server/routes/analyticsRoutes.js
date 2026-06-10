const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { createEvent, readEvents, readRecentEvents } = require('../services/analyticsRepository');

const router = express.Router();

function dateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function countBy(events, getKey) {
  const counts = new Map();

  events.forEach((event) => {
    const key = getKey(event);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function buildSummary(events = []) {
  const safeEvents = Array.isArray(events) ? events : [];
  const visits = safeEvents.filter((event) => event.type === 'page_view');
  const clicks = safeEvents.filter((event) => event.type === 'click');
  const projectClicks = clicks.filter((event) => event.label?.startsWith('project:'));
  const topClickedItems = countBy(clicks, (event) => event.target || event.label).slice(0, 8);
  const topProjects = countBy(projectClicks, (event) => event.label).slice(0, 1);
  const topSections = countBy(visits, (event) => event.section || event.path).slice(0, 8);
  const visitsByDay = countBy(visits, (event) => dateKey(event.createdAt))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-14);

  return {
    totalVisits: visits.length,
    totalClicks: clicks.length,
    visitsByDay,
    topSections,
    topClickedItems,
    lastVisit: visits[visits.length - 1]?.createdAt || null,
    profileVisits: visits.filter((event) => event.section === 'profile' || event.section === 'sobre-mi').length,
    projectVisits: visits.filter((event) => event.section === 'projects' || event.section === 'proyectos').length,
    contactVisits: visits.filter((event) => event.section === 'contact' || event.section === 'contacto').length,
    linkedinClicks: clicks.filter((event) => event.target === 'linkedin').length,
    githubClicks: clicks.filter((event) => event.target === 'github').length,
    cvClicks: clicks.filter((event) => event.target === 'cv-download').length,
    topProject: topProjects[0] || null,
    recentEvents: safeEvents.slice(-10).reverse()
  };
}

function cleanEvent(input, req) {
  const type = input?.type === 'click' ? 'click' : 'page_view';
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    path: String(input?.path || req.get('referer') || '/').slice(0, 180),
    section: input?.section ? String(input.section).slice(0, 80) : undefined,
    target: input?.target ? String(input.target).slice(0, 80) : undefined,
    label: input?.label ? String(input.label).slice(0, 140) : undefined,
    referer: req.get('referer') ? req.get('referer').slice(0, 180) : undefined,
    userAgent: req.get('user-agent') ? req.get('user-agent').slice(0, 180) : undefined,
    createdAt: new Date().toISOString()
  };

  Object.keys(event).forEach((key) => {
    if (event[key] === undefined || event[key] === '') delete event[key];
  });

  return event;
}

async function handleInteraction(req, res, next) {
  try {
    await createEvent(cleanEvent(req.body, req));
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function handleSummary(_req, res, next) {
  try {
    res.json(buildSummary(await readEvents()));
  } catch (error) {
    next(error);
  }
}

async function handleRecent(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    res.json(await readRecentEvents(limit));
  } catch (error) {
    next(error);
  }
}

router.post('/interaction', handleInteraction);
router.post('/track', handleInteraction);

router.get('/admin/metrics/summary', requireAuth, handleSummary);
router.get('/admin/metrics/recent', requireAuth, handleRecent);
router.get('/admin/stats/summary', requireAuth, handleSummary);
router.get('/admin/stats/events', requireAuth, handleRecent);

module.exports = router;
