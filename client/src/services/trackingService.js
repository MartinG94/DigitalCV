export function trackEvent(event) {
  const payload = {
    path: window.location.pathname + window.location.hash,
    ...event
  };

  return fetch('/api/interaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch((error) => {
    if (location.hostname === 'localhost') {
      console.debug('No se pudo registrar la interaccion.', error);
    }
    return null;
  });
}
