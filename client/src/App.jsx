import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { h, LoadingState } from './components/ui.js';
import { Home } from './pages/Home.jsx';
import { getCvData } from './services/api.js';
import { trackEvent } from './services/trackingService.js';
import { AdminLayout } from './components/admin/AdminLayout.js';
import { useAuth } from './context/AuthContext.jsx';
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminContent } from './pages/admin/AdminContent.js';
import { AdminProjects } from './pages/admin/AdminProjects.js';
import { AdminStats } from './pages/admin/AdminStats.js';
import { AdminSettings } from './pages/admin/AdminSettings.js';

const initialState = {
  status: 'loading',
  data: null,
  error: null
};

export function App() {
  const [state, setState] = React.useState(initialState);
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  React.useEffect(() => {
    let isMounted = true;

    if (!isAdminRoute) {
      trackEvent({ type: 'page_view', section: 'home', label: 'Landing principal' });
    }

    getCvData()
      .then((data) => {
        if (isMounted) setState({ status: 'success', data, error: null });
      })
      .catch((error) => {
        if (isMounted) setState({ status: 'error', data: null, error });
      });

    return () => {
      isMounted = false;
    };
  }, [isAdminRoute]);

  React.useEffect(() => {
    if (state.status !== 'success' || !('IntersectionObserver' in window)) return undefined;

    const tracked = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || tracked.has(entry.target.id)) return;
          tracked.add(entry.target.id);
          trackEvent({ type: 'page_view', section: entry.target.id, label: `Section ${entry.target.id}` });
        });
      },
      { threshold: 0.45 }
    );

    ['sobre-mi', 'experiencia', 'formacion', 'habilidades', 'proyectos', 'logros', 'contacto'].forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [state.status]);

  return h(
    Routes,
    null,
    h(Route, { path: '/', element: h(HomeRoute, { state }) }),
    h(Route, { path: '/admin/login', element: h(AdminLogin) }),
    h(Route, { path: '/admin', element: h(ProtectedRoute, null, h(AdminLayout)) },
      h(Route, { index: true, element: h(AdminDashboard) }),
      h(Route, { path: 'content', element: h(AdminContent) }),
      h(Route, { path: 'projects', element: h(AdminProjects) }),
      h(Route, { path: 'stats', element: h(AdminStats) }),
      h(Route, { path: 'settings', element: h(AdminSettings) })
    ),
    h(Route, { path: '*', element: h(Navigate, { to: '/', replace: true }) })
  );
}

function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (auth.status === 'checking') {
    return h('main', { className: 'loading-screen' }, h(LoadingState, { title: 'Verificando sesion', message: 'Validando tu acceso al dashboard.' }));
  }

  if (auth.status !== 'authenticated') {
    return h(Navigate, { to: '/admin/login', replace: true });
  }

  return children;
}

function HomeRoute({ state }) {
  if (state.status === 'loading') {
    return h(
      'main',
      { className: 'loading-screen' },
      h(LoadingState, { title: 'Cargando DigitalCV', message: 'Consultando perfil, proyectos y datos de contacto.' })
    );
  }

  if (state.status === 'error') {
    return h(
      'main',
      { className: 'loading-screen error-screen' },
      h('h1', null, 'No se pudo cargar el CV'),
      h('p', null, state.error?.message || 'Revisa que el backend y MongoDB esten corriendo.'),
      h('button', { className: 'btn', type: 'button', onClick: () => window.location.reload() }, 'Reintentar')
    );
  }

  return h(Home, { data: state.data });
}
