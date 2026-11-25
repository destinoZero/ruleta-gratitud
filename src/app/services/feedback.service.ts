import { Injectable, signal } from '@angular/core';

type Vibracion = number | number[];

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly silenciado = signal(false);

  private contexto?: AudioContext;
  private ultimoClic = 0;

  activar(): void {
    if (this.silenciado()) return;
    if (!this.contexto) {
      const global = globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext };
      const Constructor = global.AudioContext ?? global.webkitAudioContext;
      if (!Constructor) return;
      this.contexto = new Constructor();
    }
    if (this.contexto.state === 'suspended') void this.contexto.resume();
  }

  clicSector(): void {
    const ahora = performance.now();
    if (ahora - this.ultimoClic < 55) return;
    this.ultimoClic = ahora;
    this.vibrar(8);
    this.sonido(760, 0.025, 0.035);
  }

  aterrizar(): void {
    this.vibrar(30);
    this.sonido(420, 0.09, 0.06);
  }

  salto(): void {
    this.vibrar([12, 25, 18]);
    this.sonido(560, 0.06, 0.05);
  }

  private sonido(frecuencia: number, volumen: number, duracion: number): void {
    if (this.silenciado() || !this.contexto) return;
    const ahora = this.contexto.currentTime;
    const oscilador = this.contexto.createOscillator();
    const ganancia = this.contexto.createGain();
    oscilador.type = 'triangle';
    oscilador.frequency.setValueAtTime(frecuencia, ahora);
    ganancia.gain.setValueAtTime(volumen, ahora);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + duracion);
    oscilador.connect(ganancia);
    ganancia.connect(this.contexto.destination);
    oscilador.start(ahora);
    oscilador.stop(ahora + duracion);
  }

  private vibrar(patron: Vibracion): void {
    if (this.silenciado()) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(patron);
    }
  }
}
