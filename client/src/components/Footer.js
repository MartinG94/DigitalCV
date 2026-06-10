import { h } from './ui.js';

export function Footer({ profile }) {
  return h(
    'footer',
    { className: 'footer' },
    h(
      'div',
      { className: 'container footer-content' },
      h('p', null, `© ${new Date().getFullYear()} ${profile?.name || 'Martín Guillén'}. DigitalCV.`),
      h('p', null, 'Construido con Node.js, Express, React y MongoDB.')
    )
  );
}
