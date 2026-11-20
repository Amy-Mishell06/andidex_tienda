import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { volumeHighOutline } from 'ionicons/icons';

import { TIPOS } from '../../core/catalogos';
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
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly estado = signal<Estado>('cargando');
  readonly ficha = signal<Ficha | null>(null);
  readonly sonando = signal(false);

  /** Tipos traducidos y con su color. */
  readonly tipos = computed(() =>
    (this.ficha()?.tipos ?? []).map(
      (t) => TIPOS[t] ?? { nombre: t, color: '#1f6f5c' }
    )
  );

  /** El primer tipo define el color de toda la pantalla. */
  readonly colorTipo = computed(() => this.tipos()[0]?.color ?? '#1f6f5c');

  readonly total = computed(() =>
    (this.ficha()?.estadisticas ?? []).reduce((suma, s) => suma + s.valor, 0)
  );

  constructor() {
    addIcons({ volumeHighOutline });
    this.cargar();
  }

  cargar(): void {
    if (!Number.isInteger(this.id) || this.id < 1) {
      this.estado.set('error');
      return;
    }
    this.estado.set('cargando');
    this.dex.obtenerFicha(this.id).subscribe({
      next: (f) => {
        this.ficha.set(f);
        this.estado.set('listo');
      },
      error: () => this.estado.set('error'),
    });
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
