import { h } from './ui.js';
import { ThemeToggle } from './ThemeToggle.js';
import { trackEvent } from '../services/trackingService.js';

const navItems = [
  ['Sobre mí', '#sobre-mi'],
  ['Experiencia', '#experiencia'],
  ['Formación', '#formacion'],
  ['Habilidades', '#habilidades'],
  ['Proyectos', '#proyectos'],
  ['Logros', '#logros'],
  ['Contacto', '#contacto']
];

export function Header({ profile }) {
  const trackNavigation = (label, href) => {
    trackEvent({ type: 'click', target: 'nav', label, section: href.replace('#', '') });
  };

  return h(
    'header',
    { className: 'site-header' },
    h(
      'nav',
      { className: 'navbar container', 'aria-label': 'Navegación principal' },
      h('a', { className: 'brand', href: '#inicio' }, h('span', null, 'MG'), h('strong', null, 'DigitalCV')),
      h(
        'div',
        { className: 'nav-links' },
        ...navItems.map(([label, href]) => h('a', { key: href, href, onClick: () => trackNavigation(label, href) }, label))
      ),
      h(
        'div',
        { className: 'header-actions' },
        h(ThemeToggle),
        h(
          'a',
          {
            className: 'btn btn-small',
            href: profile?.contact?.cvPdf || '/cv/martin-guillen-cv.pdf',
            onClick: () => trackEvent({ type: 'click', target: 'cv-download', label: 'Header CV PDF' })
          },
          'Descargar CV'
        ),
        h('a', { className: 'admin-link', href: '/admin' }, 'Admin')
      )
    )
  );
}
