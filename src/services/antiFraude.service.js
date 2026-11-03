import { getState } from '@/state/store.js';
import { UMBRAL_SOSPECHOSO, UMBRAL_CRITICO, MAX_REPORTES_ATIPICOS } from '@/utils/constants.js';

const DIAS = 30;
const fechaLimite = (dias = DIAS) =>
  new Date(Date.now() - dias * 86400000).toISOString().split('T')[0];

export function analizarPrecio(precio, materialId, estado) {
  const { reportes } = getState();
  const zona = reportes.filter(r =>
    r.material_id === materialId && r.estado === estado &&
    r.fecha >= fechaLimite() && r.verificado === true
  );
  if (zona.length < 3) return { nivel:'normal', mensaje:'', esAtipico:false };

  let spv = 0, sv = 0;
  for (const r of zona) { const v = r.volumen_ton || 1; spv += r.precio_kg * v; sv += v; }
  const prom = spv / sv;
  const desv = Math.abs(precio - prom) / prom;

  if (desv > UMBRAL_CRITICO) return {
    nivel: 'critico',
    mensaje: `⚠️ El precio está ${(desv*100).toFixed(0)}% ${precio < prom ? 'por debajo' : 'por encima'} del promedio de la zona ($${prom.toFixed(2)}/kg). ¿Estás seguro?`,
    esAtipico: true,
  };
  if (desv > UMBRAL_SOSPECHOSO) return {
    nivel: 'sospechoso',
    mensaje: `El precio difiere en ${(desv*100).toFixed(0)}% del promedio de la zona ($${prom.toFixed(2)}/kg). Verifica tu dato.`,
    esAtipico: false,
  };
  return { nivel:'normal', mensaje:'', esAtipico:false };
}

export function obtenerConfianzaVendedor(email) {
  const { reportes } = getState();
  const mios = reportes.filter(r => r.usuario === email);
  if (!mios.length) return { nivel:'normal', score:100, label:'Nuevo' };
  const atipicos = mios.filter(r => !r.verificado).length;
  const ratio = atipicos / mios.length;
  if (ratio > 0.5 || atipicos >= MAX_REPORTES_ATIPICOS)
    return { nivel:'low',    score: Math.max(0, 100 - ratio*100), label:'Baja'  };
  if (ratio > 0.2)
    return { nivel:'medium', score: Math.max(0, 100 - ratio*100), label:'Media' };
  return { nivel:'high', score: 100 - ratio*100, label:'Alta' };
}

export function calcularConfianzaMercado() {
  const { reportes } = getState();
  const v = reportes.filter(r => r.verificado === true).length;
  const a = reportes.filter(r => r.verificado === false).length;
  const total = v + a;
  if (!total) return { nivel:'high', label:'Alta' };
  const ratio = v / total;
  if (ratio > 0.8) return { nivel:'high',   label:'Alta'  };
  if (ratio > 0.5) return { nivel:'medium', label:'Media' };
  return                  { nivel:'low',    label:'Baja'  };
}

/** Tendencia REAL: compara promedio período actual vs anterior. */
export function calcularTendencia(materialId, estado, tipoOperacion) {
  const { reportes } = getState();
  const hoy = new Date().toISOString().split('T')[0];
  const h30 = fechaLimite(30);
  const h60 = fechaLimite(60);
  const f = (d, h) => reportes.filter(r =>
    r.material_id === materialId && r.estado === estado &&
    r.tipo_operacion === tipoOperacion && r.fecha >= d && r.fecha < h
  );
  const act = f(h30, hoy);
  const ant = f(h60, h30);
  if (act.length < 2 || ant.length < 2) return 'stable';
  const avg = a => a.reduce((s, r) => s + r.precio_kg, 0) / a.length;
  const diff = (avg(act) - avg(ant)) / avg(ant);
  if (diff >  0.05) return 'up';
  if (diff < -0.05) return 'down';
  return 'stable';
}