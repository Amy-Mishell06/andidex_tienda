/** Elemento del listado: solo lo necesario para pintar una tarjeta. */
export interface EntradaLista {
  id: number;
  nombre: string;
  imagen: string;
}

export interface Estadistica {
  clave: string;
  etiqueta: string;
  valor: number;
}

/** Datos ya procesados para la vista de detalle. */
export interface Ficha {
  id: number;
  nombre: string;
  imagen: string;
  tipos: string[];
  alturaM: number;
  pesoKg: number;
  habilidades: string[];
  estadisticas: Estadistica[];
  grito: string | null;
  categoria: string;
  descripcion: string;
}

export interface Region {
  clave: string;
  nombre: string;
  /** Posición del primer registro en la API (offset). */
  desde: number;
  /** Cantidad de registros de la región (limit). */
  cantidad: number;
}
