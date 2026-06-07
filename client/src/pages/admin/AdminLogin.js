import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { h } from '../../components/ui.js';
import { ThemeToggle } from '../../components/ThemeToggle.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ username: '', password: '' });
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await auth.login(form.username, form.password);
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesion. Revisa usuario y contrasena.');
    } finally {
      setSubmitting(false);
    }
  };

  if (auth.status === 'authenticated') {
    return h(Navigate, { to: '/admin', replace: true });
  }

  return h(
    'main',
    { className: 'admin-login-screen' },
    h(
      'section',
      { className: 'admin-login-card' },
      h('div', { className: 'admin-login-header' }, h('h1', null, 'Admin DigitalCV'), h(ThemeToggle)),
      h('p', null, 'Acceso privado para editar contenido y revisar estadisticas.'),
      error && h('div', { className: 'alert alert-danger', role: 'alert' }, error),
      h(
        'form',
        { onSubmit },
        h(
          'label',
          { className: 'form-label' },
          'Usuario',
          h('input', {
            className: 'form-control',
            value: form.username,
            required: true,
            autoComplete: 'username',
            onChange: (event) => update('username', event.target.value)
          })
        ),
        h(
          'label',
          { className: 'form-label' },
          'Contrasena',
          h('input', {
            className: 'form-control',
            type: 'password',
            value: form.password,
            required: true,
            autoComplete: 'current-password',
            onChange: (event) => update('password', event.target.value)
          })
        ),
        h('button', { className: 'btn w-100', type: 'submit', disabled: submitting }, submitting ? 'Ingresando...' : 'Ingresar')
      )
    )
  );
}
