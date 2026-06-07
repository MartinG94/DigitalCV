import React from 'react';
import { h } from '../../components/ui.js';
import { StatCard } from '../../components/admin/StatCard.js';
import { getRecentEvents, getStatsSummary } from '../../services/adminService.js';

const emptySummary = {
  totalVisits: 0,
  totalClicks: 0,
  visitsByDay: [],
  topSections: [],
  topClickedItems: [],
  recentEvents: [],
  lastVisit: null,
  profileVisits: 0,
  projectVisits: 0,
  contactVisits: 0,
  linkedinClicks: 0,
  githubClicks: 0,
  cvClicks: 0,
  topProject: null
};

function normalizeSummary(summary = {}) {
  return {
    ...emptySummary,
    ...summary,
    totalVisits: Number(summary.totalVisits) || 0,
    totalClicks: Number(summary.totalClicks) || 0,
    profileVisits: Number(summary.profileVisits) || 0,
    projectVisits: Number(summary.projectVisits) || 0,
    contactVisits: Number(summary.contactVisits) || 0,
    linkedinClicks: Number(summary.linkedinClicks) || 0,
    githubClicks: Number(summary.githubClicks) || 0,
    cvClicks: Number(summary.cvClicks) || 0,
    visitsByDay: Array.isArray(summary.visitsByDay) ? summary.visitsByDay : [],
    topSections: Array.isArray(summary.topSections) ? summary.topSections : [],
    topClickedItems: Array.isArray(summary.topClickedItems) ? summary.topClickedItems : [],
    recentEvents: Array.isArray(summary.recentEvents) ? summary.recentEvents : [],
    topProject: summary.topProject || null
  };
}

function normalizeEvents(events) {
  return Array.isArray(events) ? events : [];
}

function SimpleList({ title, items }) {
  const safeItems = Array.isArray(items) ? items : [];

  return h(
    'article',
    { className: 'admin-panel' },
    h('h2', null, title),
    safeItems.length
      ? h('ul', { className: 'admin-simple-list' }, ...safeItems.map((item) => h('li', { key: item.label }, h('span', null, item.label), h('strong', null, item.count))))
      : h('p', { className: 'muted' }, 'Sin datos todavia.')
  );
}

export function AdminStats() {
  const [state, setState] = React.useState({
    loading: true,
    summaryLoading: true,
    recentLoading: true,
    summary: emptySummary,
    events: [],
    error: '',
    recentError: ''
  });

  React.useEffect(() => {
    let active = true;

    async function loadMetrics() {
      let nextSummary = emptySummary;
      let nextEvents = [];
      let nextError = '';
      let nextRecentError = '';

      try {
        nextSummary = normalizeSummary(await getStatsSummary());
      } catch (error) {
        nextError = error.isAuthError ? error.message : 'No se pudieron cargar las estadisticas.';
      }

      try {
        nextEvents = normalizeEvents(await getRecentEvents(40));
      } catch (_error) {
        nextRecentError = 'No se pudieron cargar los registros recientes.';
      } finally {
        if (active) {
          setState({
            loading: false,
            summaryLoading: false,
            recentLoading: false,
            summary: nextSummary,
            events: nextEvents,
            error: nextError,
            recentError: nextRecentError
          });
        }
      }
    }

    loadMetrics();

    return () => {
      active = false;
    };
  }, []);

  const summary = normalizeSummary(state.summary);
  const events = normalizeEvents(state.events);

  return h(
    'section',
    null,
    h('div', { className: 'admin-page-title' }, h('h1', null, 'Estadisticas'), h('p', null, 'Eventos anonimos guardados en JSON local.')),
    state.summaryLoading && h('p', { className: 'muted' }, 'Cargando estadisticas...'),
    state.error && h('div', { className: 'alert alert-warning' }, state.error),
    h(
      'div',
      { className: 'admin-stat-grid' },
      h(StatCard, { label: 'Visitas', value: summary.totalVisits }),
      h(StatCard, { label: 'Clicks', value: summary.totalClicks }),
      h(StatCard, { label: 'Perfil', value: summary.profileVisits }),
      h(StatCard, { label: 'Proyectos', value: summary.projectVisits }),
      h(StatCard, { label: 'Contacto', value: summary.contactVisits }),
      h(StatCard, { label: 'Proyecto top', value: summary.topProject?.label?.replace('project:', '') || '-' })
    ),
    h(
      'div',
      { className: 'admin-grid two' },
      h(SimpleList, { title: 'Visitas por dia', items: summary.visitsByDay }),
      h(SimpleList, { title: 'Secciones mas vistas', items: summary.topSections }),
      h(SimpleList, { title: 'Links mas clickeados', items: summary.topClickedItems })
    ),
    h(
      'article',
      { className: 'admin-panel' },
      h('h2', null, 'Ultimos eventos'),
      state.recentLoading
        ? h('p', { className: 'muted' }, 'Cargando eventos...')
        : state.recentError
          ? h('p', { className: 'muted' }, state.recentError)
          : events.length
          ? h(
            'div',
            { className: 'admin-events-list' },
            ...events.map((event) =>
              h(
                'div',
                { className: 'admin-event-row', key: event.id },
                h('span', { className: `event-type ${event.type}` }, event.type),
                h('strong', null, event.target || event.section || event.path),
                h('small', null, event.label || event.path || '-'),
                h('time', null, new Date(event.createdAt).toLocaleString())
              )
            )
          )
          : h('p', { className: 'muted' }, 'Todavia no hay eventos para mostrar.')
    )
  );
}
