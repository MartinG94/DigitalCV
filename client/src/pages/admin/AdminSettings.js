import { h } from '../../components/ui.js';
import { AdminContent } from './AdminContent.js';

export function AdminSettings() {
  return h(AdminContent, { initialResource: 'settings' });
}
