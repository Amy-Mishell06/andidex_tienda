import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  volumeHighOutline,
} from 'ionicons/icons';

import { REGIONES, TIPOS } from '../../core/catalogos';
import { Ficha } from '../../core/dex.models';
import { DexService } from '../../core/dex.service';
import { RadarStatsComponent } from '../../ui/radar-stats.component';

type Estado = 'cargando' | 'listo' | 'error';

@Component({
  selector: 'app-ficha',
  standalone: true,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonTitle,
    IonToolbar,
    RadarStatsComponent,
  ],
  templateUrl: './ficha.page.html',
  styleUrls: ['./ficha.page.scss'],
})
export class FichaPage {
  private readonly dex = inject(DexService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = signal(0);
  readonly ultimo =
    REGIONES[REGIONES.length - 1].desde + REGIONES[REGIONES.length - 1].cantidad;

  readonly estado = signal<Estado>('cargando');
  readonly ficha = signal<Ficha | null>(null);
  readonly sonando = signal(false);

  /** Tipos traducidos y con su color. */
  readonly tipos = computed(() =>
    (this.ficha()?.tipos ?? []).map(
      (t) => TIPOS[t] ?? { nombre: t, color: '#1f6f5c' }
    )
  );

  readonly colorTipo = computed(() => this.tipos()[0]?.color ?? '#1f6f5c');

  readonly total = computed(() =>
    (this.ficha()?.estadisticas ?? []).reduce((suma, s) => suma + s.valor, 0)
  );

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, volumeHighOutline });
    this.ruta.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.id.set(Number(params.get('id')));
      this.cargar();
    });
  }

  cargar(): void {
    const pedido = this.id();
    if (!Number.isInteger(pedido) || pedido < 1) {
      this.estado.set('error');
      return;
    }
    this.estado.set('cargando');
    this.dex.obtenerFicha(pedido).subscribe({
      next: (f) => {
        // Si el usuario ya pasó a otra ficha, esta respuesta se descarta.
        if (pedido === this.id()) {
          this.ficha.set(f);
          this.estado.set('listo');
        }
      },
      error: () => {
        if (pedido === this.id()) {
          this.estado.set('error');
        }
      },
    });
  }

  ir(paso: number): void {
    const destino = this.id() + paso;
    if (destino >= 1 && destino <= this.ultimo) {
      // replaceUrl: el botón atrás vuelve al listado, no a la ficha anterior.
      this.router.navigate(['/ficha', destino], { replaceUrl: true });
    }
  }

  reproducirGrito(): void {
    const url = this.ficha()?.grito;
    if (!url || this.sonando()) {
      return;
    }
    const audio = new Audio(url);
    audio.volume = 0.5;
    const terminar = () => this.sonando.set(false);
    audio.addEventListener('ended', terminar);
    audio.addEventListener('error', terminar);
    this.sonando.set(true);
    audio.play().catch(terminar);
  }

  numero(id: number): string {
    return '#' + String(id).padStart(4, '0');
  }
}