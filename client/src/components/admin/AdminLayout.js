import { h } from '../ui.js';
import { ThemeToggle } from '../ThemeToggle.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ErrorBoundary } from '../ErrorBoundary.jsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const items = [
  ['Resumen', '/admin'],
  ['Contenido', '/admin/content'],
  ['Proyectos', '/admin/projects'],
  ['Estadisticas', '/admin/stats'],
  ['Configuracion', '/admin/settings']
];

export function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return h(
    'div',
    { className: 'admin-shell' },
    h(
      'aside',
      { className: 'admin-sidebar' },
      h('a', { className: 'brand admin-brand', href: '/', onClick: (event) => undefined }, h('span', null, 'MG'), h('strong', null, 'Admin')),
      h(
        'nav',
        { className: 'admin-menu', 'aria-label': 'Navegacion admin' },
        ...items.map(([label, href]) =>
          h(
            'button',
            {
              key: href,
              type: 'button',
              className: location.pathname === href ? 'active' : '',
              onClick: () => navigate(href)
            },
            label
          )
        )
      )
    ),
    h(
      'div',
      { className: 'admin-main' },
      h(
        'header',
        { className: 'admin-topbar' },
        h('div', null, h('strong', null, 'Dashboard DigitalCV'), h('span', null, auth.user?.username || 'admin')),
        h(
          'div',
          { className: 'admin-topbar-actions' },
          h(ThemeToggle),
          h('a', { className: 'btn btn-outline btn-small', href: '/' }, 'Ver sitio'),
          h(
            'button',
            {
              className: 'btn btn-small',
              type: 'button',
              onClick: async () => {
                await auth.logout();
                navigate('/admin/login', { replace: true });
              }
            },
            'Salir'
          )
        )
      ),
      h('main', { className: 'admin-content' }, h(ErrorBoundary, { resetKey: location.pathname }, h(Outlet)))
    )
  );
}
