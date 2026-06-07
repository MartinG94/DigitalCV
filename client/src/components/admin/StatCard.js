import { h } from '../ui.js';

export function StatCard({ label, value, helper }) {
  return h(
    'article',
    { className: 'admin-stat-card' },
    h('span', null, label),
    h('strong', null, value ?? 0),
    helper && h('small', null, helper)
  );
}
