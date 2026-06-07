import React from 'react';
import { h } from './ui.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return h(
        'div',
        { className: 'alert alert-danger', role: 'alert' },
        this.props.message || 'No se pudo renderizar esta seccion. Proba navegar a otra seccion o recargar.'
      );
    }

    return this.props.children;
  }
}
