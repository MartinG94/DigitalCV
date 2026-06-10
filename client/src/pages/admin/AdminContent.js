import React from 'react';
import { h, EmptyState, LoadingState, StatusMessage } from '../../components/ui.js';
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

const resourceHelp = {
  profile: 'Datos principales que aparecen en la presentacion publica.',
  experience: 'Roles laborales, responsabilidades y tecnologias usadas.',
  education: 'Estudios, cursos y formacion relevante.',
  skills: 'Categorias de habilidades y herramientas.',
  projects: 'Proyectos destacados con estado, tecnologias y enlaces.',
  achievements: 'Certificaciones, logros e hitos verificables.',
  settings: 'Textos generales, contacto y disponibilidad del sitio.'
};

const fieldLabels = {
  name: 'Nombre',
  role: 'Rol profesional',
  location: 'Ubicacion',
  headline: 'Presentacion breve',
  summary: 'Resumen profesional',
  primaryTechnologies: 'Tecnologias principales',
  contact: 'Contacto',
  email: 'Email',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  cvPdf: 'CV PDF',
  company: 'Empresa',
  position: 'Puesto',
  period: 'Periodo',
  responsibilities: 'Responsabilidades',
  technologies: 'Tecnologias',
  institution: 'Institucion',
  degree: 'Titulo o curso',
  details: 'Detalle',
  category: 'Categoria',
  items: 'Items',
  description: 'Descripcion',
  githubUrl: 'URL GitHub',
  demoUrl: 'URL demo',
  status: 'Estado',
  image: 'Imagen',
  title: 'Titulo',
  issuer: 'Emisor',
  date: 'Fecha',
  siteTitle: 'Titulo del sitio',
  heroSubtitle: 'Subtitulo principal',
  aboutText: 'Texto sobre mi',
  primaryButtonText: 'Texto del boton principal',
  availability: 'Disponibilidad',
  cvFileName: 'Nombre del archivo CV',
  cvUrl: 'URL del CV',
  cvUpdatedAt: 'Ultima actualizacion del CV'
};

const fieldHelp = {
  primaryTechnologies: 'Una tecnologia por linea. Se muestran como etiquetas en la portada.',
  responsibilities: 'Una responsabilidad por linea. Evita frases demasiado largas.',
  technologies: 'Una tecnologia por linea.',
  items: 'Un item por linea.',
  githubUrl: 'Usa una URL completa, por ejemplo https://github.com/usuario/proyecto.',
  demoUrl: 'Usa una URL completa si el proyecto tiene demo publica.',
  image: 'URL de imagen opcional para el proyecto.',
  cvUrl: 'Normalmente se completa automaticamente al subir el PDF.',
  cvUpdatedAt: 'Fecha tecnica actualizada por el sistema.'
};

const placeholders = {
  email: 'nombre@dominio.com',
  linkedin: 'https://www.linkedin.com/in/usuario',
  github: 'https://github.com/usuario',
  githubUrl: 'https://github.com/usuario/proyecto',
  demoUrl: 'https://proyecto.com',
  period: 'Ene 2024 - Actualidad',
  status: 'En desarrollo',
  availability: 'Escuchando propuestas'
};

const requiredFields = {
  profile: ['name', 'role'],
  settings: ['siteTitle', 'email'],
  experience: ['company', 'position'],
  education: ['institution', 'degree'],
  skills: ['category'],
  projects: ['name', 'status'],
  achievements: ['title']
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

function fieldLabel(key) {
  return fieldLabels[key] || key.replace(/([A-Z])/g, ' $1');
}

function isLongField(key, value) {
  return key.toLowerCase().includes('summary') || key.toLowerCase().includes('description') || key.toLowerCase().includes('details') || String(value || '').length > 90;
}

function isEmptyObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((entry) => {
    if (Array.isArray(entry)) return entry.length === 0;
    if (entry && typeof entry === 'object') return isEmptyObject(entry);
    return entry === '' || entry === null || entry === undefined;
  });
}

function validateResource(resource, payload) {
  const errors = {};
  const required = requiredFields[resource] || [];

  if (Array.isArray(payload)) {
    payload.forEach((item, index) => {
      required.forEach((field) => {
        if (!String(item?.[field] || '').trim()) {
          errors[`${index}.${field}`] = `${fieldLabel(field)} es obligatorio.`;
        }
      });
    });
  } else {
    required.forEach((field) => {
      if (!String(payload?.[field] || '').trim()) {
        errors[field] = `${fieldLabel(field)} es obligatorio.`;
      }
    });
  }

  return errors;
}

function FormField({ fieldKey, value, onChange, error, path }) {
  const label = fieldLabel(fieldKey);
  const help = fieldHelp[fieldKey];
  const inputId = `field-${path.replace(/[^a-z0-9_-]+/gi, '-')}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  if (Array.isArray(value)) {
    return h(
      'label',
      { className: `form-label${error ? ' has-error' : ''}`, htmlFor: inputId },
      h('span', null, label),
      h('textarea', {
        id: inputId,
        className: 'form-control',
        rows: 4,
        value: value.join('\n'),
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        placeholder: placeholders[fieldKey] || '',
        onChange: (event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))
      }),
      help && h('small', { id: helpId, className: 'field-help' }, help),
      error && h('small', { id: errorId, className: 'field-error' }, error)
    );
  }

  return h(
    'label',
    { className: `form-label${error ? ' has-error' : ''}`, htmlFor: inputId },
    h('span', null, label),
    isLongField(fieldKey, value)
      ? h('textarea', {
        id: inputId,
        className: 'form-control',
        rows: 4,
        value: value || '',
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        placeholder: placeholders[fieldKey] || '',
        onChange: (event) => onChange(event.target.value)
      })
      : h('input', {
        id: inputId,
        className: 'form-control',
        value: value || '',
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        placeholder: placeholders[fieldKey] || '',
        onChange: (event) => onChange(event.target.value)
      }),
    help && h('small', { id: helpId, className: 'field-help' }, help),
    error && h('small', { id: errorId, className: 'field-error' }, error)
  );
}

function ObjectEditor({ value, onChange, errors = {}, pathPrefix = '' }) {
  const safeValue = ensureObject(value);

  return h(
    'div',
    { className: 'admin-form-grid' },
    ...Object.entries(safeValue).map(([key, fieldValue]) => {
      const path = pathPrefix ? `${pathPrefix}.${key}` : key;

      if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
        return h(
          'fieldset',
          { className: 'admin-fieldset', key },
          h('legend', null, fieldLabel(key)),
          h(ObjectEditor, {
            value: fieldValue,
            errors,
            pathPrefix: path,
            onChange: (updated) => onChange({ ...safeValue, [key]: updated })
          })
        );
      }

      return h(FormField, {
        key,
        fieldKey: key,
        value: fieldValue,
        path,
        error: errors[path],
        onChange: (updated) => onChange({ ...safeValue, [key]: updated })
      });
    })
  );
}

function ArrayEditor({ resource, value, errors, onChange }) {
  const items = ensureArray(value);
  const addItem = () => onChange([...items, clone(templates[resource] || {})]);
  const updateItem = (index, item) => onChange(items.map((entry, currentIndex) => (currentIndex === index ? item : entry)));
  const removeItem = (index) => {
    const label = items[index]?.name || items[index]?.title || items[index]?.company || items[index]?.category || `Registro ${index + 1}`;

    if (!window.confirm(`Eliminar "${label}"? Esta accion solo se confirma al guardar cambios.`)) return;

    onChange(items.filter((_entry, currentIndex) => currentIndex !== index));
  };

  return h(
    'div',
    { className: 'admin-list-editor' },
    h(
      'div',
      { className: 'admin-editor-toolbar' },
      h('p', { className: 'muted' }, items.length ? `${items.length} registros en esta seccion.` : 'Todavia no hay registros.'),
      h('button', { className: 'btn btn-secondary btn-small', type: 'button', onClick: addItem }, `Agregar ${resourceLabels[resource] || 'registro'}`)
    ),
    items.length
      ? items.map((item, index) =>
        h(
          'article',
          { className: 'admin-edit-card', key: `${resource}-${index}` },
          h(
            'div',
            { className: 'admin-edit-card-header' },
            h('strong', null, item.name || item.title || item.company || item.category || `Registro ${index + 1}`),
            h('button', { className: 'btn btn-outline btn-small btn-danger-ghost', type: 'button', onClick: () => removeItem(index) }, 'Eliminar')
          ),
          h(ObjectEditor, {
            value: item,
            errors,
            pathPrefix: String(index),
            onChange: (updated) => updateItem(index, updated)
          })
        )
      )
      : h(EmptyState, { title: 'Sin registros', message: 'Agrega el primer registro para completar esta seccion.' })
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
      return 'Selecciona un archivo PDF antes de subirlo.';
    }

    const hasPdfExtension = selectedFile.name.toLowerCase().endsWith('.pdf');
    const hasPdfType = selectedFile.type === 'application/pdf';

    if (!hasPdfExtension || !hasPdfType) {
      return 'El archivo debe ser un PDF valido.';
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

    if (!window.confirm('Reemplazar el CV actual por este PDF?')) return;

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
    h('p', { className: 'muted' }, 'Subi un PDF de hasta 5 MB. Al confirmar, el boton Descargar CV usara este archivo.'),
    cvUrl && h(
      'div',
      { className: 'admin-current-cv' },
      h('div', null, h('strong', null, 'Archivo actual'), h('span', null, cvFileName || 'CV cargado')),
      h(
        'div',
        { className: 'admin-cv-links' },
        h('a', { className: 'btn btn-secondary btn-small', href: cvUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Ver CV actual'),
        h('a', { className: 'btn btn-outline btn-small', href: cvUrl, download: true }, 'Descargar')
      )
    ),
    settings?.cvUpdatedAt && h('p', { className: 'admin-cv-updated muted' }, `Ultima actualizacion: ${new Date(settings.cvUpdatedAt).toLocaleString()}`),
    h(StatusMessage, { tone: 'danger' }, status.error),
    h(StatusMessage, { tone: 'success' }, status.success),
    h(
      'form',
      { className: 'admin-cv-upload', onSubmit: handleSubmit },
      h(
        'label',
        { className: 'form-label' },
        h('span', null, 'Archivo PDF'),
        h('input', {
          ref: inputRef,
          className: 'form-control',
          type: 'file',
          accept: 'application/pdf,.pdf',
          disabled: status.loading,
          onChange: (event) => {
            setFile(event.target.files?.[0] || null);
            setStatus({ loading: false, error: '', success: '' });
          }
        }),
        h('small', { className: 'field-help' }, 'Solo PDF. Tamano maximo: 5 MB.')
      ),
      h('button', { className: 'btn', type: 'submit', disabled: status.loading }, status.loading ? 'Subiendo...' : 'Subir CV')
    )
  );
}

function ResourceEditor({ resource, value, errors, onChange }) {
  return Array.isArray(value)
    ? h(ArrayEditor, { resource, value, errors, onChange })
    : h(ObjectEditor, { value, errors, onChange });
}

export function AdminContent({ initialResource = 'profile' }) {
  const [state, setState] = React.useState({ loading: true, data: null, originalData: null, error: '', success: '' });
  const [active, setActive] = React.useState(initialResource);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const loadContent = React.useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: '', success: '' }));
    setErrors({});

    getAllContent()
      .then((data) => setState({ loading: false, data, originalData: clone(data), error: '', success: '' }))
      .catch((error) => setState({ loading: false, data: null, originalData: null, error: error.message, success: '' }));
  }, []);

  React.useEffect(() => {
    loadContent();
  }, [loadContent]);

  React.useEffect(() => {
    setActive((current) => (current === initialResource ? current : initialResource));
    setErrors({});
  }, [initialResource]);

  const hasChanges = React.useMemo(() => {
    if (!state.data || !state.originalData) return false;
    return JSON.stringify(state.data[active]) !== JSON.stringify(state.originalData[active]);
  }, [active, state.data, state.originalData]);

  const updateResource = (resource, value) => {
    setState((current) => ({
      ...current,
      data: { ...current.data, [resource]: value },
      success: '',
      error: ''
    }));
    setErrors({});
  };

  const commitSavedResource = (resource, value) => {
    setState((current) => ({
      ...current,
      data: { ...current.data, [resource]: value },
      originalData: { ...current.originalData, [resource]: clone(value) },
      success: `${resourceLabels[resource]} actualizado correctamente.`,
      error: ''
    }));
    setErrors({});
  };

  const changeTab = (resource) => {
    if (resource === active) return;
    if (hasChanges && !window.confirm('Hay cambios sin guardar en esta seccion. Cambiar de seccion sin guardar?')) return;
    setActive(resource);
    setErrors({});
  };

  const cancelActive = () => {
    if (!hasChanges) return;
    if (!window.confirm('Descartar los cambios no guardados de esta seccion?')) return;
    updateResource(active, clone(state.originalData[active]));
    setState((current) => ({ ...current, success: 'Cambios descartados.', error: '' }));
  };

  const saveActive = async () => {
    const nextPayload = Array.isArray(state.data[active])
      ? state.data[active].filter((item) => !isEmptyObject(item))
      : state.data[active];
    const nextErrors = validateResource(active, nextPayload);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setState((current) => ({ ...current, error: 'Revisa los campos marcados antes de guardar.', success: '' }));
      return;
    }

    setSaving(true);
    setState((current) => ({ ...current, error: '', success: '' }));

    try {
      const saved = await saveContent(active, nextPayload);
      setState((current) => ({
        ...current,
        data: { ...current.data, [active]: saved },
        originalData: { ...current.originalData, [active]: clone(saved) },
        success: `${resourceLabels[active]} guardado correctamente.`,
        error: ''
      }));
      setErrors({});
    } catch (error) {
      setState((current) => ({ ...current, error: error.message || 'No se pudo guardar. Revisa la conexion e intenta de nuevo.', success: '' }));
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) {
    return h(LoadingState, { title: 'Cargando contenido', message: 'Consultando los datos guardados en MongoDB.' });
  }

  if (!state.data) {
    return h(
      'section',
      null,
      h(StatusMessage, { tone: 'danger' }, state.error || 'No se pudo cargar el contenido.'),
      h('button', { className: 'btn btn-secondary', type: 'button', onClick: loadContent }, 'Reintentar')
    );
  }

  return h(
    'section',
    null,
    h(
      'div',
      { className: 'admin-page-title' },
      h('div', null, h('h1', null, resourceLabels[active] || 'Contenido'), h('p', null, resourceHelp[active] || 'Edita la informacion visible del CV.')),
      h('span', { className: `status-pill ${hasChanges ? 'status-dirty' : 'status-saved'}` }, hasChanges ? 'Cambios sin guardar' : 'Actualizado')
    ),
    h(StatusMessage, { tone: 'danger' }, state.error),
    h(StatusMessage, { tone: 'success' }, state.success),
    h(
      'div',
      { className: 'admin-tabs', role: 'tablist', 'aria-label': 'Secciones editables' },
      ...Object.keys(resourceLabels).map((resource) =>
        h(
          'button',
          {
            key: resource,
            type: 'button',
            role: 'tab',
            'aria-selected': active === resource,
            className: active === resource ? 'active' : '',
            onClick: () => changeTab(resource)
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
        onUploaded: (updatedSettings) => commitSavedResource('settings', updatedSettings)
      }),
      h(ResourceEditor, {
        resource: active,
        value: state.data[active],
        errors,
        onChange: (value) => updateResource(active, value)
      }),
      h(
        'div',
        { className: 'admin-save-row' },
        h('button', { className: 'btn', type: 'button', disabled: saving || !hasChanges, onClick: saveActive }, saving ? 'Guardando...' : 'Guardar cambios'),
        h('button', { className: 'btn btn-secondary', type: 'button', disabled: saving || !hasChanges, onClick: cancelActive }, 'Cancelar cambios'),
        h('button', { className: 'btn btn-outline', type: 'button', disabled: saving, onClick: loadContent }, 'Recargar datos')
      )
    )
  );
}
