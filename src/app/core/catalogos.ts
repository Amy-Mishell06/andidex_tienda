import { Region } from './dex.models';

/**
 * Regiones como rangos de la numeración nacional.
 * Cada una se pide a la API con un solo llamado (offset + limit).
 */
export const REGIONES: Region[] = [
  { clave: 'kanto', nombre: 'Kanto', desde: 0, cantidad: 151 },
  { clave: 'johto', nombre: 'Johto', desde: 151, cantidad: 100 },
  { clave: 'hoenn', nombre: 'Hoenn', desde: 251, cantidad: 135 },
  { clave: 'sinnoh', nombre: 'Sinnoh', desde: 386, cantidad: 107 },
  { clave: 'teselia', nombre: 'Teselia', desde: 493, cantidad: 156 },
  { clave: 'kalos', nombre: 'Kalos', desde: 649, cantidad: 72 },
  { clave: 'alola', nombre: 'Alola', desde: 721, cantidad: 88 },
  { clave: 'galar', nombre: 'Galar', desde: 809, cantidad: 96 },
  { clave: 'paldea', nombre: 'Paldea', desde: 905, cantidad: 120 },
];

/** Nombre en español y color de cada tipo. */
export const TIPOS: Record<string, { nombre: string; color: string }> = {
  normal: { nombre: 'Normal', color: '#8a8a7a' },
  fire: { nombre: 'Fuego', color: '#d9622b' },
  water: { nombre: 'Agua', color: '#3f7fd6' },
  electric: { nombre: 'Eléctrico', color: '#c9a20e' },
  grass: { nombre: 'Planta', color: '#4f9a3c' },
  ice: { nombre: 'Hielo', color: '#4aa9a6' },
  fighting: { nombre: 'Lucha', color: '#b23a32' },
  poison: { nombre: 'Veneno', color: '#8e3f9c' },
  ground: { nombre: 'Tierra', color: '#b08a3a' },
  flying: { nombre: 'Volador', color: '#7a78d6' },
  psychic: { nombre: 'Psíquico', color: '#d6487a' },
  bug: { nombre: 'Bicho', color: '#8a9a1e' },
  rock: { nombre: 'Roca', color: '#9a8433' },
  ghost: { nombre: 'Fantasma', color: '#5e4a8a' },
  dragon: { nombre: 'Dragón', color: '#5b3fd6' },
  dark: { nombre: 'Siniestro', color: '#5a4a40' },
  steel: { nombre: 'Acero', color: '#7f8aa0' },
  fairy: { nombre: 'Hada', color: '#c76a9a' },
};

export const ETIQUETAS_STAT: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};
