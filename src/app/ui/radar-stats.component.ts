import { Component, computed, input } from '@angular/core';

import { Estadistica } from '../core/dex.models';

const CENTRO = 120;
const RADIO = 78;
/** Valor que llena el radar; casi ninguna estadística base lo supera. */
const TOPE = 160;

function punto(indice: number, total: number, radio: number): [number, number] {
  const angulo = (-90 + (360 / total) * indice) * (Math.PI / 180);
  return [CENTRO + radio * Math.cos(angulo), CENTRO + radio * Math.sin(angulo)];
}

/**
 * Estadísticas base dibujadas como radar SVG, sin librerías externas.
 */
@Component({
  selector: 'app-radar-stats',
  standalone: true,
  template: `
    <svg viewBox="0 0 240 240" role="img" aria-label="Estadísticas base">
      @for (anillo of anillos(); track $index) {
        <polygon class="anillo" [attr.points]="anillo" />
      }
      <polygon class="area" [attr.points]="area()" />
      @for (e of etiquetas(); track e.clave) {
        <text class="nombre" [attr.x]="e.x" [attr.y]="e.y" text-anchor="middle">
          {{ e.etiqueta }}
        </text>
        <text class="valor" [attr.x]="e.x" [attr.y]="e.y + 13" text-anchor="middle">
          {{ e.valor }}
        </text>
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 320px;
        margin: 0 auto;
      }
      svg {
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .anillo {
        fill: none;
        stroke: currentColor;
        stroke-opacity: 0.18;
      }
      .area {
        fill: var(--color-tipo, #1f6f5c);
        fill-opacity: 0.35;
        stroke: var(--color-tipo, #1f6f5c);
        stroke-width: 2;
        stroke-linejoin: round;
      }
      .nombre {
        font-size: 10px;
        fill: currentColor;
        opacity: 0.7;
      }
      .valor {
        font-size: 12px;
        font-weight: 700;
        fill: currentColor;
      }
    `,
  ],
})
export class RadarStatsComponent {
  readonly datos = input.required<Estadistica[]>();

  readonly anillos = computed(() => {
    const n = this.datos().length || 6;
    return [1 / 3, 2 / 3, 1].map((f) =>
      Array.from({ length: n }, (_, i) => punto(i, n, RADIO * f).join(',')).join(' ')
    );
  });

  readonly area = computed(() => {
    const d = this.datos();
    return d
      .map((s, i) => {
        const proporcion = Math.min(s.valor, TOPE) / TOPE;
        return punto(i, d.length, RADIO * Math.max(proporcion, 0.06)).join(',');
      })
      .join(' ');
  });

  readonly etiquetas = computed(() => {
    const d = this.datos();
    return d.map((s, i) => {
      const [x, y] = punto(i, d.length, RADIO + 24);
      return { ...s, x, y: y - 2 };
    });
  });
}
