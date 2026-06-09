import React from 'react';
import { h } from '../../components/ui.js';
import { getAllContent, saveContent, uploadCvPdf } from '../../services/adminService.js';

const resourceLabels = {
  profile: 'Perfil',
  experience: 'Experiencia',
  education: 'Formacion',
  skills: 'Habilidades',
  projects: 'Proyectos',
  achievements: 'Logros',
  settings: 'Configuracion'
};

const templates = {
  experience: {
    company: '',
    position: '',
    period: '',
    location: '',
    summary: '',
    responsibilities: [],
    technologies: []
  },
  education: {
    institution: '',
    degree: '',
    period: '',
    location: '',
    details: ''
  },
  skills: {
    category: '',
    items: []
  },
  projects: {
    name: '',
    description: '',
    technologies: [],
    githubUrl: '',
    demoUrl: '',
    status: 'En desarrollo',
    image: ''
  },
  achievements: {
    title: '',
    issuer: '',
    date: '',
    description: ''
  }
};

const maxCvSizeBytes = 5 * 1024 * 1024;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function isLongField(key, value) {
  return key.toLowerCase().includes('summary') || key.toLowerCase().includes('description') || key.toLowerCase().includes('details') || String(value || '').length > 90;
}

function FormField({ fieldKey, value, onChange }) {
  const label = fieldKey.replace(/([A-Z])/g, ' $1');

  if (Array.isArray(value)) {
    return h(
      'label',
      { className: 'form-label' },
      label,
      h('textarea', {
        className: 'form-control',
        rows: 4,
        value: value.join('\n'),
        onChange: (event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))
      })
    );
  }

  return h(
    'label',
    { className: 'form-label' },
    label,
    isLongField(fieldKey, value)
      ? h('textarea', { className: 'form-control', rows: 4, value: value || '', onChange: (event) => onChange(event.target.value) })
      : h('input', { className: 'form-control', value: value || '', onChange: (event) => onChange(event.target.value) })
  );
}

function ObjectEditor({ value, onChange }) {
  const safeValue = ensureObject(value);

  return h(
    'div',
    { className: 'admin-form-grid' },
    ...Object.entries(safeValue).map(([key, fieldValue]) => {
      if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
        return h(
          'fieldset',
          { className: 'admin-fieldset', key },
          h('legend', null, key),
          h(ObjectEditor, {
            value: fieldValue,
            onChange: (updated) => onChange({ ...safeValue, [key]: updated })
          })
        );
      }

      return h(FormField, {
        key,
        fieldKey: key,
        value: fieldValue,
        onChange: (updated) => onChange({ ...safeValue, [key]: updated })
      });
    })
  );
}

function ArrayEditor({ resource, value, onChange }) {
  const items = ensureArray(value);
  const addItem = () => onChange([...items, clone(templates[resource] || {})]);
  const updateItem = (index, item) => onChange(items.map((entry, currentIndex) => (currentIndex === index ? item : entry)));
  const removeItem = (index) => onChange(items.filter((_entry, currentIndex) => currentIndex !== index));

  return h(
    'div',
    { className: 'admin-list-editor' },
    h('button', { className: 'btn btn-secondary btn-small', type: 'button', onClick: addItem }, 'Agregar'),
    ...items.map((item, index) =>
      h(
        'article',
        { className: 'admin-edit-card', key: `${resource}-${index}` },
        h(
          'div',
          { className: 'admin-edit-card-header' },
          h('strong', null, item.name || item.title || item.company || item.category || `Registro ${index + 1}`),
          h('button', { className: 'btn btn-outline btn-small', type: 'button', onClick: () => removeItem(index) }, 'Eliminar')
        ),
        h(ObjectEditor, { value: item, onChange: (updated) => updateItem(index, updated) })
      )
    )
  );
}

function SettingsCvUpload({ settings, onUploaded }) {
  const inputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState({ loading: false, error: '', success: '' });
  const cvUrl = settings?.cvUrl || settings?.cvPdf || '';
  const cvFileName = settings?.cvFileName || (cvUrl ? cvUrl.split('/').filter(Boolean).pop() : '');

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return 'Tenes que seleccionar un archivo PDF.';
    }

    const hasPdfExtension = selectedFile.name.toLowerCase().endsWith('.pdf');
    const hasPdfType = selectedFile.type === 'application/pdf';

    if (!hasPdfExtension || !hasPdfType) {
      return 'El archivo debe ser un PDF.';
    }

    if (selectedFile.size > maxCvSizeBytes) {
      return 'El archivo no debe superar los 5 MB.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateFile(file);
    if (validationError) {
      setStatus({ loading: false, error: validationError, success: '' });
      return;
    }

    setStatus({ loading: true, error: '', success: '' });

    try {
      const updatedSettings = await uploadCvPdf(file);
      onUploaded(updatedSettings);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setStatus({ loading: false, error: '', success: 'CV actualizado correctamente.' });
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'No se pudo subir el CV.', success: '' });
    }
  };

  return h(
    'fieldset',
    { className: 'admin-fieldset admin-cv-section' },
    h('legend', null, 'CV en PDF'),
    h('p', { className: 'muted' }, 'Subi el archivo PDF que se descargara desde el boton Descargar CV del sitio publico.'),
    cvUrl && h(
      'div',
      { className: 'admin-current-cv' },
      h('div', null, h('strong', null, 'Archivo actual'), h('span', null, cvFileName || 'CV cargado')),
      h(
        'div',
        { className: 'admin-cv-links' },
        h('a', { className: 'btn btn-secondary btn-small', href: cvUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Ver CV actual'),
        h('a', { className: 'btn btn-outline btn-small', href: cvUrl, download: true }, 'Descargar CV actual')
      )
    ),
    settings?.cvUpdatedAt && h('p', { className: 'admin-cv-updated muted' }, `Ultima actualizacion: ${new Date(settings.cvUpdatedAt).toLocaleString()}`),
    status.error && h('div', { className: 'alert alert-danger' }, status.error || 'No se pudo subir el CV.'),
    status.success && h('div', { className: 'alert alert-success' }, status.success),
    h(
      'form',
      { className: 'admin-cv-upload', onSubmit: handleSubmit },
      h(
        'label',
        { className: 'form-label' },
        'Archivo PDF',
        h('input', {
          ref: inputRef,
          className: 'form-control',
          type: 'file',
          accept: 'application/pdf,.pdf',
          onChange: (event) => {
            setFile(event.target.files?.[0] || null);
            setStatus({ loading: false, error: '', success: '' });
          }
        })
      ),
      h('button', { className: 'btn', type: 'submit', disabled: status.loading }, status.loading ? 'Subiendo...' : 'Subir CV')
    )
  );
}

function ResourceEditor({ resource, value, onChange }) {
  return Array.isArray(value)
    ? h(ArrayEditor, { resource, value, onChange })
    : h(ObjectEditor, { value, onChange });
}

export function AdminContent({ initialResource = 'profile' }) {
  const [state, setState] = React.useState({ loading: true, data: null, error: '', success: '' });
  const [active, setActive] = React.useState(initialResource);

  React.useEffect(() => {
    getAllContent()
      .then((data) => setState({ loading: false, data, error: '', success: '' }))
      .catch((error) => setState({ loading: false, data: null, error: error.message, success: '' }));
  }, []);

  React.useEffect(() => {
    setActive((current) => (current === initialResource ? current : initialResource));
  }, [initialResource]);

  const updateResource = (resource, value) => {
    setState((current) => ({
      ...current,
      data: { ...current.data, [resource]: value },
      success: '',
      error: ''
    }));
  };

  const saveActive = async () => {
    try {
      const saved = await saveContent(active, state.data[active]);
      updateResource(active, saved);
      setState((current) => ({ ...current, success: `${resourceLabels[active]} guardado correctamente.`, error: '' }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message, success: '' }));
    }
  };

  if (state.loading) {
    return h('p', { className: 'muted' }, 'Cargando contenido...');
  }

  if (!state.data) {
    return h('div', { className: 'alert alert-danger' }, state.error || 'No se pudo cargar el contenido.');
  }

  return h(
    'section',
    null,
    h('div', { className: 'admin-page-title' }, h('h1', null, resourceLabels[active] || 'Contenido'), h('p', null, 'Edita los datos guardados en JSON local.')),
    state.error && h('div', { className: 'alert alert-danger' }, state.error),
    state.success && h('div', { className: 'alert alert-success' }, state.success),
    h(
      'div',
      { className: 'admin-tabs' },
      ...Object.keys(resourceLabels).map((resource) =>
        h(
          'button',
          {
            key: resource,
            type: 'button',
            className: active === resource ? 'active' : '',
            onClick: () => setActive(resource)
          },
          resourceLabels[resource]
        )
      )
    ),
    h(
      'article',
      { className: 'admin-panel' },
      active === 'settings' && h(SettingsCvUpload, {
        settings: state.data.settings,
        onUploaded: (updatedSettings) => updateResource('settings', updatedSettings)
      }),
      h(ResourceEditor, {
        resource: active,
        value: state.data[active],
        onChange: (value) => updateResource(active, value)
      }),
      h('div', { className: 'admin-save-row' }, h('button', { className: 'btn', type: 'button', onClick: saveActive }, 'Guardar cambios'))
    )
  );
}
