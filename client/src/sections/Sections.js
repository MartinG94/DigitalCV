import { h, SectionTitle, SkillBadge } from '../components/ui.js';
import { ExperienceCard, EducationCard, ProjectCard, AchievementCard } from '../components/Cards.js';

export function HeroSection({ profile }) {
  return h(
    'section',
    { id: 'inicio', className: 'hero section' },
    h(
      'div',
      { className: 'container hero-grid' },
      h(
        'div',
        { className: 'hero-copy' },
        h('span', { className: 'eyebrow' }, profile.location),
        h('h1', null, profile.name),
        h('p', { className: 'hero-role' }, profile.role),
        h('p', { className: 'hero-headline' }, profile.headline),
        h(
          'div',
          { className: 'hero-actions' },
          h('a', { className: 'btn', href: '#contacto' }, 'Contactar'),
          h('a', { className: 'btn btn-secondary', href: '#proyectos' }, 'Ver proyectos')
        )
      ),
      h(
        'div',
        { className: 'hero-panel', 'aria-label': 'Resumen tecnológico' },
        h('p', null, 'Tecnologías principales'),
        h('div', { className: 'badge-row' }, ...profile.primaryTechnologies.map((tech) => h(SkillBadge, { key: tech, skill: tech })))
      )
    )
  );
}

export function AboutSection({ profile }) {
  return h(
    'section',
    { id: 'sobre-mi', className: 'section' },
    h(
      'div',
      { className: 'container two-column' },
      h(SectionTitle, {
        eyebrow: 'Sobre mí',
        title: 'Perfil profesional orientado a soluciones web y sistemas',
        description: profile.summary
      }),
      h(
        'div',
        { className: 'info-card' },
        h('strong', null, 'Objetivo del sitio'),
        h('p', null, 'Centralizar información profesional, experiencia, formación y proyectos en una landing dinámica, fácil de mantener y lista para evolucionar.')
      )
    )
  );
}

export function ExperienceSection({ experience }) {
  return h(
    'section',
    { id: 'experiencia', className: 'section section-alt' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Experiencia', title: 'Trayectoria laboral', description: 'Roles, responsabilidades y tecnologías utilizadas.' }),
      h('div', { className: 'timeline' }, ...experience.map((item) => h(ExperienceCard, { key: `${item.company}-${item.position}`, item })))
    )
  );
}

export function EducationSection({ education }) {
  return h(
    'section',
    { id: 'formacion', className: 'section' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Formación', title: 'Formación académica', description: 'Estudios y capacitaciones relevantes para el perfil técnico.' }),
      h('div', { className: 'grid two' }, ...education.map((item) => h(EducationCard, { key: `${item.institution}-${item.degree}`, item })))
    )
  );
}

export function SkillsSection({ skills }) {
  return h(
    'section',
    { id: 'habilidades', className: 'section section-alt' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Skills', title: 'Habilidades técnicas', description: 'Stack principal y herramientas de trabajo.' }),
      h(
        'div',
        { className: 'grid skill-grid' },
        ...skills.map((group) =>
          h(
            'article',
            { className: 'card skill-card', key: group.category },
            h('h3', null, group.category),
            h('div', { className: 'badge-row' }, ...group.items.map((skill) => h(SkillBadge, { key: skill, skill })))
          )
        )
      )
    )
  );
}

export function ProjectsSection({ projects }) {
  return h(
    'section',
    { id: 'proyectos', className: 'section' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Portfolio', title: 'Proyectos', description: 'Muestras de trabajo, prácticas y soluciones listas para completar con links reales.' }),
      h('div', { className: 'grid three' }, ...projects.map((project) => h(ProjectCard, { key: project.name, project })))
    )
  );
}

export function AchievementsSection({ achievements }) {
  return h(
    'section',
    { id: 'logros', className: 'section section-alt' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Logros', title: 'Certificaciones e hitos', description: 'Espacio para destacar logros académicos y certificaciones verificables.' }),
      h('div', { className: 'grid two' }, ...achievements.map((item) => h(AchievementCard, { key: item.title, item })))
    )
  );
}

export function ContactSection({ profile }) {
  const contact = profile.contact || {};

  return h(
    'section',
    { id: 'contacto', className: 'section contact-section' },
    h(
      'div',
      { className: 'container contact-card' },
      h(SectionTitle, { eyebrow: 'Contacto', title: 'Conversemos', description: 'Links preparados para recruiters y oportunidades profesionales.' }),
      h(
        'div',
        { className: 'contact-actions' },
        h('a', { className: 'btn', href: `mailto:${contact.email}` }, 'Enviar email'),
        h('a', { className: 'btn btn-secondary', href: contact.linkedin, target: '_blank', rel: 'noreferrer' }, 'LinkedIn'),
        h('a', { className: 'btn btn-secondary', href: contact.github, target: '_blank', rel: 'noreferrer' }, 'GitHub'),
        h('a', { className: 'btn btn-outline', href: contact.cvPdf }, 'Descargar CV PDF')
      ),
      h('p', { className: 'muted' }, `Email placeholder: ${contact.email}`)
    )
  );
}
