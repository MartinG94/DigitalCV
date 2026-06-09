import React from 'react';
import { h } from './ui.js';
import { ThemeToggle } from './ThemeToggle.js';
import { useAuth } from '../context/AuthContext.jsx';
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
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isAdminAuthenticated = auth?.status === 'authenticated';
  const cvPdf = profile?.contact?.cvPdf;

  const trackNavigation = (label, href) => {
    trackEvent({ type: 'click', target: 'nav', label, section: href.replace('#', '') });
    setIsMenuOpen(false);
  };

  return h(
    'header',
    { className: 'site-header' },
    h(
      'nav',
      { className: 'navbar navbar-expand-lg app-navbar', 'aria-label': 'Navegación principal' },
      h(
        'div',
        { className: 'container app-navbar-inner' },
        h('a', { className: 'brand navbar-brand', href: '#inicio', onClick: () => setIsMenuOpen(false) }, h('span', null, 'MG'), h('strong', null, 'DigitalCV')),
        h(
          'button',
          {
            className: 'navbar-toggler app-navbar-toggler',
            type: 'button',
            'aria-controls': 'public-navbar-menu',
            'aria-expanded': isMenuOpen,
            'aria-label': isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación',
            onClick: () => setIsMenuOpen((current) => !current)
          },
          h('span', { className: 'navbar-toggler-icon' })
        ),
        h(
          'div',
          {
            id: 'public-navbar-menu',
            className: `collapse navbar-collapse app-navbar-collapse${isMenuOpen ? ' show' : ''}`
          },
          h(
            'ul',
            { className: 'navbar-nav nav-links app-nav-links mx-lg-auto' },
            ...navItems.map(([label, href]) =>
              h(
                'li',
                { key: href, className: 'nav-item' },
                h('a', { className: 'nav-link app-nav-link', href, onClick: () => trackNavigation(label, href) }, label)
              )
            )
          ),
          h(
            'div',
            { className: 'header-actions app-navbar-actions' },
            h(ThemeToggle),
            cvPdf && h(
              'a',
              {
                className: 'btn btn-small app-cv-button',
                href: cvPdf,
                target: '_blank',
                rel: 'noopener noreferrer',
                download: true,
                onClick: () => {
                  trackEvent({ type: 'click', target: 'cv-download', label: 'Header CV PDF' });
                  setIsMenuOpen(false);
                }
              },
              'Descargar CV'
            ),
            isAdminAuthenticated && h('a', { className: 'admin-link', href: '/admin', onClick: () => setIsMenuOpen(false) }, 'Dashboard')
          )
        )
      )
    )
  );
}
