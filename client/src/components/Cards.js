import { h, SkillBadge } from './ui.js';
import { trackEvent } from '../services/trackingService.js';

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function ExperienceCard({ item }) {
  return h(
    'article',
    { className: 'card timeline-card' },
    h('div', { className: 'card-meta' }, item.period),
    h('h3', null, item.position),
    h('p', { className: 'muted' }, `${item.company} · ${item.location}`),
    h('p', null, item.summary),
    h('ul', null, ...ensureArray(item.responsibilities).map((task) => h('li', { key: task }, task))),
    h('div', { className: 'badge-row' }, ...ensureArray(item.technologies).map((tech) => h(SkillBadge, { key: tech, skill: tech })))
  );
}

export function EducationCard({ item }) {
  return h(
    'article',
    { className: 'card' },
    h('div', { className: 'card-meta' }, item.period),
    h('h3', null, item.degree),
    h('p', { className: 'muted' }, `${item.institution} · ${item.location}`),
    h('p', null, item.details)
  );
}

export function ProjectCard({ project }) {
  const hasLinks = project.githubUrl || project.demoUrl;

  return h(
    'article',
    { className: 'card project-card' },
    h(
      'div',
      { className: 'project-media' },
      project.image ? h('img', { src: project.image, alt: `Imagen del proyecto ${project.name}` }) : h('span', null, '</>')
    ),
    h('div', { className: 'status-pill' }, project.status),
    h('h3', null, project.name),
    h('p', null, project.description),
    h('div', { className: 'badge-row' }, ...ensureArray(project.technologies).map((tech) => h(SkillBadge, { key: tech, skill: tech }))),
    hasLinks &&
      h(
        'div',
        { className: 'card-actions' },
        project.githubUrl &&
          h(
            'a',
            {
              href: project.githubUrl,
              target: '_blank',
              rel: 'noreferrer',
              onClick: () => trackEvent({ type: 'click', target: 'github', label: `project:${project.name}` })
            },
            'GitHub'
          ),
        project.demoUrl &&
          h(
            'a',
            {
              href: project.demoUrl,
              target: '_blank',
              rel: 'noreferrer',
              onClick: () => trackEvent({ type: 'click', target: 'project-demo', label: `project:${project.name}` })
            },
            'Demo'
          )
      )
  );
}

export function AchievementCard({ item }) {
  return h(
    'article',
    { className: 'card achievement-card' },
    h('div', { className: 'card-meta' }, item.date),
    h('h3', null, item.title),
    h('p', { className: 'muted' }, item.issuer),
    h('p', null, item.description)
  );
}
