const endpoints = {
  profile: '/api/profile',
  experience: '/api/experience',
  education: '/api/education',
  skills: '/api/skills',
  projects: '/api/projects',
  achievements: '/api/achievements',
  settings: '/api/settings'
};

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error ${response.status} al consultar ${url}`);
  }

  return response.json();
}

export async function getCvData() {
  const entries = await Promise.all(
    Object.entries(endpoints).map(async ([key, url]) => [key, await fetchJson(url)])
  );

  return Object.fromEntries(entries);
}
