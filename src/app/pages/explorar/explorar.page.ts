import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';

import { REGIONES } from '../../core/catalogos';
import { EntradaLista, Region } from '../../core/dex.models';
import { DexService } from '../../core/dex.service';

type Estado = 'cargando' | 'listo' | 'error';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [
    RouterLink,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './explorar.page.html',
  styleUrls: ['./explorar.page.scss'],
})
export class ExplorarPage {
  private readonly dex = inject(DexService);

  readonly regiones = REGIONES;
  readonly huecos = Array.from({ length: 12 }, (_, i) => i);

  readonly region = signal<Region>(REGIONES[0]);
  readonly estado = signal<Estado>('cargando');
  readonly entradas = signal<EntradaLista[]>([]);
  readonly filtro = signal('');

  /** Lista filtrada por nombre o por número. */
  readonly visibles = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) {
      return this.entradas();
    }
    return this.entradas().filter(
      (e) => e.nombre.toLowerCase().includes(texto) || String(e.id) === texto
    );
  });

  constructor() {
    addIcons({ informationCircleOutline });
    this.cargar();
  }

  alCambiarRegion(evento: Event): void {
    const clave = (evento as CustomEvent).detail?.value;
    const nueva = REGIONES.find((r) => r.clave === clave);
    if (nueva && nueva.clave !== this.region().clave) {
      this.region.set(nueva);
      this.filtro.set('');
      this.cargar();
    }
  }

  alBuscar(evento: Event): void {
    this.filtro.set(String((evento as CustomEvent).detail?.value ?? ''));
  }

  /** Deslizar hacia abajo: vuelve a pedir la región ignorando la caché. */
  refrescar(evento: Event): void {
    const refresher = evento.target as unknown as { complete: () => void };
    this.dex.olvidarRegion(this.region().clave);
    this.cargar(() => refresher.complete());
  }

  /** alTerminar solo se usa al refrescar: así la lista no se borra mientras carga. */
  cargar(alTerminar?: () => void): void {
    const pedida = this.region();
    if (!alTerminar) {
      this.estado.set('cargando');
    }
    this.dex
      .listarRegion(pedida)
      .pipe(finalize(() => alTerminar?.()))
      .subscribe({
        next: (lista) => {
          // Si el usuario cambió de región mientras llegaba la respuesta, se descarta.
          if (pedida.clave === this.region().clave) {
            this.entradas.set(lista);
            this.estado.set('listo');
          }
        },
        error: () => {
          if (pedida.clave === this.region().clave) {
            this.estado.set('error');
          }
        },
      });
  }

  numero(id: number): string {
    return '#' + String(id).padStart(4, '0');
  }
}