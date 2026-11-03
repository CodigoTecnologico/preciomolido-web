import { randomUUID } from 'node:crypto';

export const materials = [
  { id: 1,  material: 'PET',         presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Transparente' },
  { id: 2,  material: 'PET',         presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Verde' },
  { id: 3,  material: 'PET',         presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Azul' },
  { id: 4,  material: 'PET',         presentacion: 'Hojuela',    origen: 'Post-Consumo',    color: 'Transparente' },
  { id: 5,  material: 'HDPE',        presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Natural' },
  { id: 6,  material: 'HDPE',        presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Color' },
  { id: 7,  material: 'HDPE',        presentacion: 'Peletizado', origen: 'Post-Industrial', color: 'Negro' },
  { id: 8,  material: 'LDPE',        presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Transparente' },
  { id: 9,  material: 'LDPE',        presentacion: 'Paca',       origen: 'Post-Consumo',    color: 'Mixto' },
  { id: 10, material: 'PP',          presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Natural' },
  { id: 11, material: 'PP',          presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Color' },
  { id: 12, material: 'PP',          presentacion: 'Peletizado', origen: 'Post-Industrial', color: 'Negro' },
  { id: 13, material: 'PS',          presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Blanco' },
  { id: 14, material: 'ABS',         presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Negro' },
  { id: 15, material: 'PVC',         presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Blanco' },
  { id: 16, material: 'PC',          presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Transparente' },
  { id: 17, material: 'Nylon',       presentacion: 'Molido',     origen: 'Post-Industrial', color: 'Natural' },
  { id: 18, material: 'PEBD',        presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Mixto' },
  { id: 19, material: 'Poliestireno',presentacion: 'Molido',     origen: 'Post-Consumo',    color: 'Blanco' },
  { id: 20, material: 'PET',         presentacion: 'Peletizado', origen: 'Post-Consumo',    color: 'Grado Alimenticio' }
];

const basePrices = { 
  1:14.5, 2:10.2, 3:9.5, 4:12.0, 5:18.5, 6:13.0, 7:19.5, 
  8:12.5, 9:6.5, 10:20.0, 11:15.5, 12:22.0, 13:17.5, 14:18.0, 
  15:11.5, 16:35.0, 17:28.0, 18:8.5, 19:12.5, 20:18.0 
};

const estados = ['Jalisco','Nuevo León','Ciudad de México','Puebla','Guanajuato','Querétaro','Estado de México','Veracruz', 'Chihuahua', 'Yucatán'];
const usuarios = ['acopiador1@demo.com','acopiador2@demo.com','recicladora@demo.com','plastico_juarez@demo.com','gdl_recycling@demo.com','monterrey_plast@demo.com'];

export const reports = (() => {
  const arr = [];
  const today = Date.now();
  const DIAS_HISTORIAL = 365; // 1 año completo de datos

  for (let d = 0; d < DIAS_HISTORIAL; d++) {
    const fecha = new Date(today - d * 86400000).toISOString().split('T')[0];
    
    // Generar entre 8 y 15 reportes por día
    const reportesDelDia = Math.floor(Math.random() * 8) + 8;

    for (let i = 0; i < reportesDelDia; i++) {
      const mat = materials[Math.floor(Math.random() * materials.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const tipo = Math.random() < 0.55 ? 'Compra' : 'Venta';
      
      let base = basePrices[mat.id] || 15;
      
      // Simular tendencias (fluctuación lenta en el tiempo)
      // Ejemplo: El precio sube o baja un 10% dependiendo de la estación o días
      const tendencia = Math.sin(d / 30) * 0.10; 
      
      // Ruido diario aleatorio (-5% a +5%)
      const ruido = (Math.random() - 0.5) * 0.10;
      
      const precio = Math.max(1, +(base * (1 + tendencia + ruido)).toFixed(2));
      
      arr.push({
        id: randomUUID(),
        material_id: mat.id,
        precio_kg: precio,
        estado,
        municipio: 'No especificado',
        volumen_ton: +(Math.random() * 15 + 0.5).toFixed(1),
        tipo_operacion: tipo,
        contaminacion: Math.random() > 0.7 ? '<1%' : '1-3%',
        fecha,
        verificado: Math.random() > 0.1, // 90% verificados, 10% atípicos
        usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
      });
    }
  }
  return arr;
})();

export const users = [
  { id: randomUUID(), nombre: 'Acopiador Demo',   email: 'acopiador@demo.com',   password: 'demo123', tipo: 'Acopiador', estado: 'Jalisco' },
  { id: randomUUID(), nombre: 'Recicladora Demo', email: 'recicladora@demo.com', password: 'demo123', tipo: 'Transformador / Reciclador', estado: 'Nuevo León' },
];

export const publications = (() => {
  const arr = [];
  const today = Date.now();
  for (let i = 0; i < 25; i++) { // Más publicaciones en el market
    const mat = materials[Math.floor(Math.random() * materials.length)];
    const tipo = Math.random() < 0.5 ? 'Compra' : 'Venta';
    const base = basePrices[mat.id] || 15;
    arr.push({
      id: randomUUID(),
      tipo,
      material_id: mat.id,
      presentacion: mat.presentacion,
      origen: mat.origen,
      color: mat.color,
      precio_kg: +(base + (Math.random() - 0.5) * 4).toFixed(2),
      volumen_ton: +(Math.random() * 30 + 1).toFixed(1),
      estado: estados[Math.floor(Math.random() * estados.length)],
      municipio: 'No especificado',
      garantia: Math.random() > 0.5 ? 'Sí' : 'No',
      descripcion: 'Material de buena calidad, listo para entrega. Se aceptan muestras.',
      foto: null,
      fecha: new Date(today - i * 43200000).toISOString(), // Cada 12 horas
      activo: true,
      es_atipico: false,
      usuario_email: 'acopiador@demo.com',
      usuario_nombre: 'Acopiador Demo',
    });
  }
  return arr;
})();

export const alerts = [];
export const offers = [];
export const ratings = [];
export const sellerReports = [];
export const suggestions = [];
