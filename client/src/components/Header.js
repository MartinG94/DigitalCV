import { h } from './ui.js';

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
        ...navItems.map(([label, href]) => h('a', { key: href, href }, label))
      ),
      h('a', { className: 'btn btn-small', href: profile?.contact?.cvPdf || '/cv/martin-guillen-cv.pdf' }, 'Descargar CV')
    )
  );
}
