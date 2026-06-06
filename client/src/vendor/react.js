const Fragment = Symbol('Fragment');
let rootRenderer = null;
let hookIndex = 0;
let hookState = [];
let pendingEffects = [];

function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat().filter((child) => child !== false && child !== true && child !== null && child !== undefined)
  };
}

function useState(initialValue) {
  const currentIndex = hookIndex;
  hookState[currentIndex] = hookState[currentIndex] ?? initialValue;

  function setState(nextValue) {
    hookState[currentIndex] = typeof nextValue === 'function' ? nextValue(hookState[currentIndex]) : nextValue;
    if (rootRenderer) rootRenderer();
  }

  hookIndex += 1;
  return [hookState[currentIndex], setState];
}

function depsChanged(previousDeps, nextDeps) {
  if (!previousDeps || !nextDeps) return true;
  if (previousDeps.length !== nextDeps.length) return true;
  return nextDeps.some((dep, index) => !Object.is(dep, previousDeps[index]));
}

function useEffect(effect, deps) {
  const currentIndex = hookIndex;
  const previous = hookState[currentIndex];

  if (depsChanged(previous?.deps, deps)) {
    pendingEffects.push(() => {
      if (typeof previous?.cleanup === 'function') previous.cleanup();
      const cleanup = effect();
      hookState[currentIndex] = { deps, cleanup };
    });
  }

  hookIndex += 1;
}

function applyProp(node, name, value) {
  if (name === 'children' || name === 'key') return;
  if (name === 'className') {
    node.setAttribute('class', value);
    return;
  }
  if (name.startsWith('on') && typeof value === 'function') {
    node.addEventListener(name.slice(2).toLowerCase(), value);
    return;
  }
  if (value === false || value === null || value === undefined) return;
  if (value === true) {
    node.setAttribute(name, '');
    return;
  }
  node.setAttribute(name, value);
}

function renderNode(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }

  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    vnode.forEach((child) => fragment.appendChild(renderNode(child)));
    return fragment;
  }

  if (vnode.type === Fragment) {
    const fragment = document.createDocumentFragment();
    vnode.children.forEach((child) => fragment.appendChild(renderNode(child)));
    return fragment;
  }

  if (typeof vnode.type === 'function') {
    return renderNode(vnode.type({ ...vnode.props, children: vnode.children }));
  }

  const node = document.createElement(vnode.type);
  Object.entries(vnode.props || {}).forEach(([name, value]) => applyProp(node, name, value));
  vnode.children.forEach((child) => node.appendChild(renderNode(child)));
  return node;
}

export function __render(vnode, container) {
  rootRenderer = () => __render(vnode, container);
  hookIndex = 0;
  pendingEffects = [];
  container.replaceChildren(renderNode(vnode));
  pendingEffects.forEach((effect) => effect());
}

export default {
  Fragment,
  createElement,
  useEffect,
  useState
};
