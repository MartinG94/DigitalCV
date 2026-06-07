const endpoints = {
  profile: '/api/profile',
  experience: '/api/experience',
  education: '/api/education',
  skills: '/api/skills',
  projects: '/api/projects',
  achievements: '/api/achievements',
  settings: '/api/settings'
};

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.url = options.url;
    this.cause = options.cause;
  }
}

async function fetchJson(url) {
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new ApiError('No se pudo conectar con la API. Verificá que el backend esté corriendo en http://localhost:3000.', {
      url,
      cause: error
    });
  }

  if (!response.ok) {
    if (response.status === 502) {
      throw new ApiError('No se pudo conectar con la API. Verificá que el backend esté corriendo en http://localhost:3000.', {
        status: response.status,
        url
      });
    }

    throw new Error(`Error ${response.status} al consultar ${url}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError(`La API devolvió una respuesta inválida al consultar ${url}.`, {
      status: response.status,
      url,
      cause: error
    });
  }
}

export async function getCvData() {
  const entries = await Promise.all(
    Object.entries(endpoints).map(async ([key, url]) => [key, await fetchJson(url)])
  );

  return Object.fromEntries(entries);
}
