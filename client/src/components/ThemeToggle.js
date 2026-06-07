import { h } from './ui.js';
import { useTheme } from '../context/ThemeContext.jsx';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return h(
    'button',
    {
      className: 'theme-toggle',
      type: 'button',
      onClick: toggleTheme,
      title: isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
      'aria-label': isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
    },
    h('span', null, isDark ? 'L' : 'D'),
    h('strong', null, isDark ? 'Claro' : 'Oscuro')
  );
}
