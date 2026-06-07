import { h } from '../../components/ui.js';
import { AdminContent } from './AdminContent.js';

export function AdminProjects() {
  return h(AdminContent, { initialResource: 'projects' });
}
