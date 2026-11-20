import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay } from 'rxjs';

import { ETIQUETAS_STAT } from './catalogos';
import { EntradaLista, Ficha, Region } from './dex.models';

const API = 'https://pokeapi.co/api/v2';
const ARTE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

/** "mr-mime" -> "Mr Mime" */
function embellecer(texto: string): string {
  return texto
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

/** Devuelve el último texto en español de una lista con idioma, o ''. */
function enEspanol(lista: any[] | undefined, campo: string): string {
  const es = (lista ?? []).filter((x) => x?.language?.name === 'es');
  const ultimo = es[es.length - 1];
  return ultimo ? String(ultimo[campo]).replace(/[\n\f\r]+/g, ' ').trim() : '';
}

@Injectable({ providedIn: 'root' })
export class DexService {
  private readonly http = inject(HttpClient);

  // Caché en memoria: cada región y cada ficha se piden una sola vez
  // (lo pide la política de uso justo de PokeAPI).
  private readonly regiones = new Map<string, Observable<EntradaLista[]>>();
  private readonly fichas = new Map<number, Observable<Ficha>>();

  listarRegion(region: Region): Observable<EntradaLista[]> {
    const guardada = this.regiones.get(region.clave);
    if (guardada) {
      return guardada;
    }

    const peticion = this.http
      .get<{ results: { name: string; url: string }[] }>(
        `${API}/pokemon?offset=${region.desde}&limit=${region.cantidad}`
      )
      .pipe(
        map((r) =>
          r.results.map((item) => {
            // La url termina en ".../pokemon/25/": de ahí sale el número.
            const id = Number(item.url.split('/').filter(Boolean).pop());
            return {
              id,
              nombre: embellecer(item.name),
              imagen: `${ARTE}/${id}.png`,
            };
          })
        ),
        shareReplay(1),
        catchError((err) => {
          this.regiones.delete(region.clave); // permite reintentar
          throw err;
        })
      );

    this.regiones.set(region.clave, peticion);
    return peticion;
  }

  obtenerFicha(id: number): Observable<Ficha> {
    const guardada = this.fichas.get(id);
    if (guardada) {
      return guardada;
    }

    const peticion = forkJoin({
      base: this.http.get<any>(`${API}/pokemon/${id}`),
      // Si falla la especie igual mostramos la ficha, sin descripción.
      especie: this.http
        .get<any>(`${API}/pokemon-species/${id}`)
        .pipe(catchError(() => of(null))),
    }).pipe(
      map(({ base, especie }) => this.armarFicha(base, especie)),
      shareReplay(1),
      catchError((err) => {
        this.fichas.delete(id);
        throw err;
      })
    );

    this.fichas.set(id, peticion);
    return peticion;
  }

  private armarFicha(base: any, especie: any): Ficha {
    const nombreEs = enEspanol(especie?.names, 'name');
    return {
      id: base.id,
      nombre: nombreEs || embellecer(base.name),
      imagen:
        base.sprites?.other?.['official-artwork']?.front_default ??
        base.sprites?.front_default ??
        `${ARTE}/${base.id}.png`,
      tipos: (base.types ?? []).map((t: any) => t.type.name as string),
      alturaM: base.height / 10, // la API entrega decímetros
      pesoKg: base.weight / 10, // la API entrega hectogramos
      habilidades: (base.abilities ?? []).map((a: any) =>
        embellecer(a.ability.name)
      ),
      estadisticas: (base.stats ?? []).map((s: any) => ({
        clave: s.stat.name,
        etiqueta: ETIQUETAS_STAT[s.stat.name] ?? embellecer(s.stat.name),
        valor: s.base_stat,
      })),
      grito: base.cries?.latest ?? base.cries?.legacy ?? null,
      categoria: enEspanol(especie?.genera, 'genus'),
      descripcion: enEspanol(especie?.flavor_text_entries, 'flavor_text'),
    };
  }
}
