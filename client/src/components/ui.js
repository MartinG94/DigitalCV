import React from '../vendor/react.js';

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
