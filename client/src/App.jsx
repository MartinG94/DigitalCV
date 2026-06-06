import React from './vendor/react.js';
import { h } from './components/ui.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { getCvData } from './services/api.js';
import {
  HeroSection,
  AboutSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  AchievementsSection,
  ContactSection
} from './sections/Sections.js';

const initialState = {
  status: 'loading',
  data: null,
  error: null
};

export function App() {
  const [state, setState] = React.useState(initialState);

  React.useEffect(() => {
    let isMounted = true;

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
  }, []);

  if (state.status === 'loading') {
    return h('main', { className: 'loading-screen' }, h('div', { className: 'loader' }), h('p', null, 'Cargando DigitalCV...'));
  }

  if (state.status === 'error') {
    return h(
      'main',
      { className: 'loading-screen error-screen' },
      h('h1', null, 'No se pudo cargar el CV'),
      h('p', null, state.error.message)
    );
  }

  const { profile, experience, education, skills, projects, achievements } = state.data;

  return h(
    React.Fragment,
    null,
    h(Header, { profile }),
    h(
      'main',
      null,
      h(HeroSection, { profile }),
      h(AboutSection, { profile }),
      h(ExperienceSection, { experience }),
      h(EducationSection, { education }),
      h(SkillsSection, { skills }),
      h(ProjectsSection, { projects }),
      h(AchievementsSection, { achievements }),
      h(ContactSection, { profile })
    ),
    h(Footer, { profile })
  );
}
