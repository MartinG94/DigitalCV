import React from 'react';

export const h = React.createElement;

export function SectionTitle({ eyebrow, title, description }) {
  return h(
    'div',
    { className: 'section-title' },
    eyebrow && h('span', { className: 'eyebrow' }, eyebrow),
    h('h2', null, title),
    description && h('p', null, description)
  );
}

export function SkillBadge({ skill }) {
  return h('span', { className: 'skill-badge' }, skill);
}

export function LoadingState({ title = 'Cargando...', message = 'Estamos preparando la informacion.' }) {
  return h(
    'div',
    { className: 'state-box state-loading', role: 'status', 'aria-live': 'polite' },
    h('div', { className: 'loader' }),
    h('strong', null, title),
    message && h('p', null, message)
  );
}

export function EmptyState({ title = 'Sin datos todavia', message, action }) {
  return h(
    'div',
    { className: 'state-box state-empty' },
    h('strong', null, title),
    message && h('p', null, message),
    action
  );
}

export function StatusMessage({ tone = 'info', children }) {
  if (!children) return null;

  const className = tone === 'success'
    ? 'alert alert-success'
    : tone === 'warning'
      ? 'alert alert-warning'
      : tone === 'danger'
        ? 'alert alert-danger'
        : 'alert alert-info';

  return h('div', { className, role: tone === 'danger' ? 'alert' : 'status' }, children);
}
