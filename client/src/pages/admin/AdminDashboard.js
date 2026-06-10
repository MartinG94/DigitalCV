import React from 'react';
import { useNavigate } from 'react-router-dom';
import { h, LoadingState, StatusMessage } from '../../components/ui.js';
import { StatCard } from '../../components/admin/StatCard.js';
import { getStatsSummary } from '../../services/adminService.js';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({ loading: true, stats: null, error: '' });

  React.useEffect(() => {
    let mounted = true;

    getStatsSummary()
      .then((stats) => {
        if (mounted) setState({ loading: false, stats, error: '' });
      })
      .catch((error) => {
        if (mounted) setState({ loading: false, stats: null, error: error.message });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = state.stats || {};

  return h(
    'section',
    null,
    h('div', { className: 'admin-page-title' }, h('div', null, h('h1', null, 'Resumen general'), h('p', null, 'Indicadores rapidos del sitio publico y accesos recientes.'))),
    state.loading && h(LoadingState, { title: 'Cargando resumen', message: 'Consultando metricas del sitio.' }),
    h(StatusMessage, { tone: 'danger' }, state.error),
    h(
      'div',
      { className: 'admin-stat-grid' },
      h(StatCard, { label: 'Visitas', value: stats.totalVisits }),
      h(StatCard, { label: 'Clicks', value: stats.totalClicks }),
      h(StatCard, { label: 'LinkedIn', value: stats.linkedinClicks }),
      h(StatCard, { label: 'GitHub', value: stats.githubClicks }),
      h(StatCard, { label: 'Descargas CV', value: stats.cvClicks }),
      h(StatCard, { label: 'Ultima visita', value: stats.lastVisit ? new Date(stats.lastVisit).toLocaleString() : '-' })
    ),
    h(
      'div',
      { className: 'admin-action-row' },
      h('button', { className: 'btn', type: 'button', onClick: () => navigate('/admin/content') }, 'Editar contenido'),
      h('button', { className: 'btn btn-secondary', type: 'button', onClick: () => navigate('/admin/stats') }, 'Ver estadisticas')
    )
  );
}
