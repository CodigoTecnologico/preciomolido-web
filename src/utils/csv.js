/** Escapa un valor para CSV (RFC 4180) */
function escaparCSV(valor) {
  if (valor == null) return '';
  const s = String(valor);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes(';')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Convierte un array de objetos a CSV.
 * @param {Array<Object>} filas
 * @param {Array<{key:string, label:string}>} columnas
 * @param {string} separador
 */
export function generarCSV(filas, columnas, separador = ',') {
  const headers = columnas.map(c => escaparCSV(c.label)).join(separador);
  const rows = filas.map(fila =>
    columnas.map(c => {
      let v = fila[c.key];
      if (typeof v === 'number' && c.formato) v = c.formato(v);
      return escaparCSV(v);
    }).join(separador)
  );
  return [headers, ...rows].join('\n');
}

/** Descarga un string como archivo */
export function descargarArchivo(contenido, nombre) {
  // BOM para que Excel respete UTF-8
  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Genera el nombre del archivo con fecha */
export function nombreArchivoCSV(prefijo) {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fecha = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  return prefijo + '_' + fecha + '.csv';
}
