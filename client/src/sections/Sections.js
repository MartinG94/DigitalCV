import { h, EmptyState, SectionTitle, SkillBadge } from '../components/ui.js';
import { ExperienceCard, EducationCard, ProjectCard, AchievementCard } from '../components/Cards.js';
import { trackEvent } from '../services/trackingService.js';

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function HeroSection({ profile, settings }) {
  const technologies = ensureArray(profile.primaryTechnologies);
  const availability = settings?.availability || 'Disponible para conversar';

  return h(
    'section',
    { id: 'inicio', className: 'hero section' },
    h(
      'div',
      { className: 'container hero-grid' },
      h(
        'div',
        { className: 'hero-copy' },
        h('span', { className: 'eyebrow' }, profile.location || availability),
        h('h1', null, profile.name),
        h('p', { className: 'hero-role' }, profile.role),
        h('p', { className: 'hero-headline' }, profile.headline),
        h(
          'div',
          { className: 'hero-actions' },
          h('a', { className: 'btn', href: '#contacto', onClick: () => trackEvent({ type: 'click', target: 'contact', label: 'Hero contactar' }) }, settings?.primaryButtonText || 'Contactar'),
          h('a', { className: 'btn btn-secondary', href: '#proyectos', onClick: () => trackEvent({ type: 'click', target: 'projects', label: 'Hero proyectos' }) }, 'Ver proyectos')
        ),
        h(
          'div',
          { className: 'hero-metrics', 'aria-label': 'Resumen del perfil' },
          h('span', null, h('strong', null, technologies.length || 0), ' tecnologias'),
          h('span', null, h('strong', null, availability), ' estado')
        )
      ),
      h(
        'div',
        { className: 'hero-panel', 'aria-label': 'Resumen tecnologico' },
        h('p', null, 'Tecnologias principales'),
        technologies.length
          ? h('div', { className: 'badge-row' }, ...technologies.map((tech) => h(SkillBadge, { key: tech, skill: tech })))
          : h(EmptyState, { title: 'Stack pendiente', message: 'Carga tecnologias desde el dashboard para mostrarlas aca.' })
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
        eyebrow: 'Sobre mi',
        title: 'Perfil profesional orientado a soluciones web y sistemas',
        description: profile.summary
      }),
      h(
        'div',
        { className: 'info-card' },
        h('strong', null, 'Propuesta profesional'),
        h('p', null, 'Perfil tecnico presentado en una experiencia clara, navegable y facil de mantener desde el dashboard.')
      )
    )
  );
}

export function ExperienceSection({ experience }) {
  const items = ensureArray(experience);

  return h(
    'section',
    { id: 'experiencia', className: 'section section-alt' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Experiencia', title: 'Trayectoria laboral', description: 'Roles, responsabilidades y tecnologias utilizadas.' }),
      items.length
        ? h('div', { className: 'timeline' }, ...items.map((item) => h(ExperienceCard, { key: `${item.company}-${item.position}`, item })))
        : h(EmptyState, { title: 'Experiencia pendiente', message: 'Cuando se carguen roles laborales, van a aparecer en esta seccion.' })
    )
  );
}

export function EducationSection({ education }) {
  const items = ensureArray(education);

  return h(
    'section',
    { id: 'formacion', className: 'section' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Formacion', title: 'Formacion academica', description: 'Estudios y capacitaciones relevantes para el perfil tecnico.' }),
      items.length
        ? h('div', { className: 'grid two' }, ...items.map((item) => h(EducationCard, { key: `${item.institution}-${item.degree}`, item })))
        : h(EmptyState, { title: 'Formacion pendiente', message: 'Agrega estudios o capacitaciones desde el dashboard.' })
    )
  );
}

export function SkillsSection({ skills }) {
  const items = ensureArray(skills);

  return h(
    'section',
    { id: 'habilidades', className: 'section section-alt' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Skills', title: 'Habilidades tecnicas', description: 'Stack principal y herramientas de trabajo.' }),
      items.length
        ? h(
          'div',
          { className: 'grid skill-grid' },
          ...items.map((group) =>
            h(
              'article',
              { className: 'card skill-card', key: group.category },
              h('h3', null, group.category),
              h('div', { className: 'badge-row' }, ...ensureArray(group.items).map((skill) => h(SkillBadge, { key: skill, skill })))
            )
          )
        )
        : h(EmptyState, { title: 'Habilidades pendientes', message: 'Crea categorias para mostrar el stack tecnico.' })
    )
  );
}

export function ProjectsSection({ projects }) {
  const items = ensureArray(projects);

  return h(
    'section',
    { id: 'proyectos', className: 'section' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Portfolio', title: 'Proyectos', description: 'Muestras de trabajo, practicas y soluciones listas para completar con links reales.' }),
      items.length
        ? h('div', { className: 'grid three' }, ...items.map((project) => h(ProjectCard, { key: project.name, project })))
        : h(EmptyState, { title: 'Proyectos pendientes', message: 'Agrega proyectos destacados desde el dashboard.' })
    )
  );
}

export function AchievementsSection({ achievements }) {
  const items = ensureArray(achievements);

  return h(
    'section',
    { id: 'logros', className: 'section section-alt' },
    h(
      'div',
      { className: 'container' },
      h(SectionTitle, { eyebrow: 'Logros', title: 'Certificaciones e hitos', description: 'Espacio para destacar logros academicos y certificaciones verificables.' }),
      items.length
        ? h('div', { className: 'grid two' }, ...items.map((item) => h(AchievementCard, { key: item.title, item })))
        : h(EmptyState, { title: 'Logros pendientes', message: 'Carga certificaciones o hitos para destacarlos aca.' })
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
      h(SectionTitle, { eyebrow: 'Contacto', title: 'Conversemos', description: 'Canales directos para oportunidades profesionales y consultas.' }),
      h(
        'div',
        { className: 'contact-actions' },
        contact.email && h('a', { className: 'btn', href: `mailto:${contact.email}`, onClick: () => trackEvent({ type: 'click', target: 'email', label: 'Email contacto' }) }, 'Enviar email'),
        contact.linkedin && h('a', { className: 'btn btn-secondary', href: contact.linkedin, target: '_blank', rel: 'noreferrer', onClick: () => trackEvent({ type: 'click', target: 'linkedin', label: 'LinkedIn profile' }) }, 'LinkedIn'),
        contact.github && h('a', { className: 'btn btn-secondary', href: contact.github, target: '_blank', rel: 'noreferrer', onClick: () => trackEvent({ type: 'click', target: 'github', label: 'GitHub profile' }) }, 'GitHub'),
        contact.cvPdf && h('a', { className: 'btn btn-outline', href: contact.cvPdf, download: true, onClick: () => trackEvent({ type: 'click', target: 'cv-download', label: 'Contact CV PDF' }) }, 'Descargar CV PDF')
      ),
      contact.email && h('p', { className: 'muted' }, `Email: ${contact.email}`)
    )
  );
}
