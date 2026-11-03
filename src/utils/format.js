export const formatMoney = (n) => `$${Number(n).toFixed(2)}`;
export const formatDate  = (d) => new Date(d).toLocaleDateString('es-MX');
export const formatDateTime = (d) => new Date(d).toLocaleString('es-MX');

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export function formatMonth(ym) {
  const [y, m] = ym.split('-');
  return `${MESES[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}