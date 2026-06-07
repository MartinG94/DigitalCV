import React from 'react';
import { h } from '../components/ui.js';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import {
  HeroSection,
  AboutSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  AchievementsSection,
  ContactSection
} from '../sections/Sections.js';

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function Home({ data }) {
  const profile = ensureObject(data?.profile);
  const settings = ensureObject(data?.settings);
  const publicProfile = {
    ...profile,
    headline: settings.heroSubtitle || profile.headline,
    summary: settings.aboutText || profile.summary,
    contact: {
      ...(profile.contact || {}),
      email: settings.email || profile.contact?.email,
      linkedin: settings.linkedin || profile.contact?.linkedin,
      github: settings.github || profile.contact?.github,
      cvPdf: settings.cvPdf || profile.contact?.cvPdf
    }
  };

  return h(
    React.Fragment,
    null,
    h(Header, { profile: publicProfile }),
    h(
      'main',
      null,
      h(HeroSection, { profile: publicProfile, settings }),
      h(AboutSection, { profile: publicProfile }),
      h(ExperienceSection, { experience: ensureArray(data?.experience) }),
      h(EducationSection, { education: ensureArray(data?.education) }),
      h(SkillsSection, { skills: ensureArray(data?.skills) }),
      h(ProjectsSection, { projects: ensureArray(data?.projects) }),
      h(AchievementsSection, { achievements: ensureArray(data?.achievements) }),
      h(ContactSection, { profile: publicProfile })
    ),
    h(Footer, { profile: publicProfile })
  );
}
