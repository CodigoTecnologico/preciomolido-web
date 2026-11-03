const state = {
  currentUser: null,
  materiales: [], reportes: [], publicacionesMK: [],
  calificaciones: [], reportesVendedor: [], ofertas: [],
  alertas: [], sugerenciasMateriales: [],
  theme: localStorage.getItem('precioMolido_theme') || 'light',
  activePanel: 'dashboard',
  viewMode: 'cards',
  dashboardPage: 1,
  marketplacePage: 1,
  dashboardFilters: { material:'todos', estado:'todos', operacion:'todos', calidad:'todos', q:'', sort:'' },
  marketplaceFilters: { material:'todos', estado:'todos', operacion:'todos', q:'', sort:'fecha-desc' },
};

const listeners = new Set();
export const getState = () => state;
export const setState = (patch) => { Object.assign(state, patch); listeners.forEach(fn => fn(state)); };
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const isLoggedIn = () => !!state.currentUser;