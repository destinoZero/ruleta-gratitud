import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { VERSICULOS } from '../data/versiculos';
import { FaseRuleta, Segmento, Versiculo } from '../models/wheel.model';
import { FeedbackService } from './feedback.service';
import { PaletteService } from './palette.service';

export const TOTAL_SEGMENTOS = 12;
export const ANGULO_SEGMENTO = 360 / TOTAL_SEGMENTOS;
export const VELOCIDAD_MAX = 1.6;
export const FRICCION = VELOCIDAD_MAX / 5000;
export const MAX_DURACION_GIRO = 5000;
export const DURACION_SNAP = 380;
export const DURACION_SALTO = 300;

export type DireccionGiro = 1 | -1;

export function mod(valor: number, modulo: number): number {
  return ((valor % modulo) + modulo) % modulo;
}

export function diferenciaCorta(desde: number, hasta: number): number {
  return mod(hasta - desde + 180, 360) - 180;
}

export function indiceEn(rotacion: number): number {
  return mod(Math.floor((-rotacion + ANGULO_SEGMENTO / 2) / ANGULO_SEGMENTO), TOTAL_SEGMENTOS);
}

export function siguienteLibre(
  desde: number,
  usados: readonly number[],
  direccion: DireccionGiro = 1,
): number {
  for (let paso = 1; paso <= TOTAL_SEGMENTOS; paso++) {
    const indice = mod(desde + direccion * paso, TOTAL_SEGMENTOS);
    if (!usados.includes(indice)) return indice;
  }
  return desde;
}

@Injectable({ providedIn: 'root' })
export class WheelEngine {
  private readonly paleta = inject(PaletteService);
  private readonly feedback = inject(FeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rotacion = signal(0);
  readonly fase = signal<FaseRuleta>('idle');
  readonly dibujados = signal<readonly number[]>([]);
  readonly resultado = signal<Versiculo | null>(null);
  readonly colores = signal<readonly string[]>([]);
  readonly giros = signal(0);

  readonly segmentos = computed<Segmento[]>(() =>
    VERSICULOS.map((versiculo, indice) => ({
      indice,
      etiqueta: versiculo.etiqueta,
      color: this.colores()[indice] ?? '#fde68a',
      usado: this.dibujados().includes(indice),
    })),
  );

  private velocidad = 0;
  private direccion: DireccionGiro = 1;
  private ultimoAngulo = 0;
  private ultimoTiempo = 0;
  private ultimoMovimiento = 0;
  private ultimoIndice = 0;
  private frame = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.cancelarFrame());
    this.reiniciar();
  }

  reiniciar(): void {
    this.cancelarFrame();
    this.velocidad = 0;
    this.direccion = 1;
    this.rotacion.set(0);
    this.dibujados.set([]);
    this.resultado.set(null);
    this.colores.set(this.paleta.generar(TOTAL_SEGMENTOS));
    this.fase.set('idle');
    this.giros.set(0);
    this.ultimoIndice = 0;
  }

  iniciarArrastre(angulo: number, tiempo = performance.now()): boolean {
    if (this.fase() !== 'idle') return false;
    this.feedback.activar();
    this.fase.set('dragging');
    this.ultimoAngulo = angulo;
    this.ultimoTiempo = tiempo;
    this.ultimoMovimiento = tiempo;
    this.velocidad = 0;
    return true;
  }

  moverArrastre(angulo: number, tiempo = performance.now()): void {
    if (this.fase() !== 'dragging') return;
    const dt = Math.max(tiempo - this.ultimoTiempo, 1);
    const delta = diferenciaCorta(this.ultimoAngulo, angulo);
    if (Math.abs(delta) < 0.01) return;
    this.rotacion.update((valor) => valor + delta);
    const instantanea = Math.max(-VELOCIDAD_MAX, Math.min(VELOCIDAD_MAX, delta / dt));
    this.velocidad = this.velocidad * 0.6 + instantanea * 0.4;
    this.ultimoAngulo = angulo;
    this.ultimoTiempo = tiempo;
    this.ultimoMovimiento = tiempo;
    this.actualizarCruce();
  }

  finalizarArrastre(tiempo = performance.now()): void {
    if (this.fase() !== 'dragging') return;
    if (tiempo - this.ultimoMovimiento > 120) this.velocidad = 0;
    if (Math.abs(this.velocidad) < 0.04) {
      this.direccion = this.velocidad >= 0 ? 1 : -1;
      this.snap();
      return;
    }
    this.giros.update((valor) => valor + 1);
    this.iniciarGiro();
  }

  girar(): void {
    if (this.fase() !== 'idle') return;
    this.feedback.activar();
    this.velocidad = 0.9 + Math.random() * 0.6;
    this.giros.update((valor) => valor + 1);
    this.iniciarGiro();
  }

  private iniciarGiro(): void {
    this.direccion = this.velocidad >= 0 ? 1 : -1;
    this.fase.set('spinning');
    this.ultimoTiempo = performance.now();
    let acumulado = 0;

    const paso = (ahora: number): void => {
      const dt = Math.min(Math.max(ahora - this.ultimoTiempo, 0), 50);
      this.ultimoTiempo = ahora;
      acumulado += dt;
      const signo = Math.sign(this.velocidad) || 1;
      const restante = Math.abs(this.velocidad) / FRICCION;

      if (this.velocidad === 0 || dt >= restante || acumulado >= MAX_DURACION_GIRO) {
        const distancia = (signo * this.velocidad * this.velocidad) / (2 * FRICCION);
        this.rotacion.update((valor) => valor + distancia);
        this.velocidad = 0;
        this.actualizarCruce();
        this.snap();
        return;
      }

      const avance = signo * (Math.abs(this.velocidad) * dt - 0.5 * FRICCION * dt * dt);
      this.rotacion.update((valor) => valor + avance);
      this.velocidad -= signo * FRICCION * dt;
      this.actualizarCruce();
      this.frame = requestAnimationFrame(paso);
    };

    this.frame = requestAnimationFrame(paso);
  }

  private snap(): void {
    this.cancelarFrame();
    this.fase.set('snapping');
    const inicio = this.rotacion();
    const indice = indiceEn(inicio);
    const destino = inicio + diferenciaCorta(mod(inicio, 360), mod(-indice * ANGULO_SEGMENTO, 360));
    const comienzo = performance.now();

    const paso = (ahora: number): void => {
      const progreso = Math.min((ahora - comienzo) / DURACION_SNAP, 1);
      const suave = 1 - Math.pow(1 - progreso, 3);
      this.rotacion.set(inicio + (destino - inicio) * suave);
      if (progreso < 1) {
        this.frame = requestAnimationFrame(paso);
        return;
      }
      this.rotacion.set(destino);
      this.feedback.aterrizar();
      this.resolver(indice);
    };

    this.frame = requestAnimationFrame(paso);
  }

  private resolver(indice: number): void {
    const usados = this.dibujados();
    if (!usados.includes(indice)) {
      this.registrar(indice);
      return;
    }

    const direccionIndice: DireccionGiro = this.direccion === 1 ? -1 : 1;
    const libre = siguienteLibre(indice, usados, direccionIndice);
    const pasos = mod((libre - indice) * direccionIndice, TOTAL_SEGMENTOS);
    if (pasos === 0) {
      this.registrar(indice);
      return;
    }

    this.fase.set('skipping');
    this.feedback.salto();
    const inicio = this.rotacion();
    const destino = inicio + this.direccion * pasos * ANGULO_SEGMENTO;
    const duracion = Math.min(900, DURACION_SALTO * pasos);
    const comienzo = performance.now();

    const paso = (ahora: number): void => {
      const progreso = Math.min((ahora - comienzo) / duracion, 1);
      const suave =
        progreso < 0.5 ? 2 * progreso * progreso : 1 - Math.pow(-2 * progreso + 2, 2) / 2;
      this.rotacion.set(inicio + (destino - inicio) * suave);
      this.actualizarCruce();
      if (progreso < 1) {
        this.frame = requestAnimationFrame(paso);
        return;
      }
      this.rotacion.set(destino);
      this.registrar(libre);
    };

    this.frame = requestAnimationFrame(paso);
  }

  private registrar(indice: number): void {
    this.dibujados.update((lista) => (lista.includes(indice) ? lista : [...lista, indice]));
    this.resultado.set(VERSICULOS[indice]);
    this.ultimoIndice = indice;
    this.fase.set(this.dibujados().length === TOTAL_SEGMENTOS ? 'done' : 'idle');
  }

  private actualizarCruce(): void {
    const indice = indiceEn(this.rotacion());
    if (indice === this.ultimoIndice) return;
    this.ultimoIndice = indice;
    this.feedback.clicSector();
  }

  private cancelarFrame(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
}
