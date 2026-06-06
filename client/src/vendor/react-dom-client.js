import { __render } from './react.js';

export function createRoot(container) {
  return {
    render: (element) => __render(element, container)
  };
}
