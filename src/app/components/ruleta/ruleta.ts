import { Component, computed, effect, inject, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { VERSICULOS } from '../../data/versiculos';
import { FeedbackService } from '../../services/feedback.service';
import { ANGULO_SEGMENTO, WheelEngine, mod } from '../../services/wheel-engine.service';

@Component({
  selector: 'app-ruleta',
  standalone: true,
  imports: [NzButtonModule, NzCardModule, NzIconModule, NzProgressModule, NzTagModule],
  templateUrl: './ruleta.html',
  styleUrl: './ruleta.scss',
})
export class Ruleta {
  readonly engine = inject(WheelEngine);
  readonly feedback = inject(FeedbackService);
  readonly completado = output<void>();

  private readonly mensaje = inject(NzMessageService);

  readonly bloqueada = computed(() => this.engine.fase() !== 'idle');
  readonly porcentaje = computed(() => Math.round((this.engine.dibujados().length / VERSICULOS.length) * 100));

  constructor() {
    effect(() => {
      if (this.engine.fase() === 'done') this.completado.emit();
    });
  }

  reiniciar(): void {
    this.engine.reiniciar();
  }

  referenciaDe(indice: number): string {
    return VERSICULOS[indice].referencia;
  }

  alternarSonido(): void {
    const silenciado = !this.feedback.silenciado();
    this.feedback.silenciado.set(silenciado);
    if (!silenciado) this.feedback.activar();
  }

  async compartir(): Promise<void> {
    const versiculo = this.engine.resultado();
    if (!versiculo) return;
    const texto = `Hoy me tocó: ${versiculo.referencia}. ¡Feliz día de Acción de gracias!`;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Ruleta de Gratitud', text: texto });
      } catch {
        return;
      }
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      this.mensaje.success('Pasaje copiado al portapapeles');
      return;
    }
    this.mensaje.warning('Este navegador no permite compartir');
  }

  alPointerDown(evento: PointerEvent): void {
    const angulo = this.anguloDesde(evento);
    if (!this.engine.iniciarArrastre(angulo)) return;
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
    evento.preventDefault();
  }

  alPointerMove(evento: PointerEvent): void {
    if (this.engine.fase() !== 'dragging') return;
    this.engine.moverArrastre(this.anguloDesde(evento));
    evento.preventDefault();
  }

  alPointerUp(evento: PointerEvent): void {
    if (this.engine.fase() !== 'dragging') return;
    this.engine.finalizarArrastre();
    const objetivo = evento.currentTarget as HTMLElement;
    if (objetivo.hasPointerCapture(evento.pointerId)) objetivo.releasePointerCapture(evento.pointerId);
    evento.preventDefault();
  }

  rutaSegmento(indice: number): string {
    const inicio = indice * ANGULO_SEGMENTO - ANGULO_SEGMENTO / 2;
    const fin = inicio + ANGULO_SEGMENTO;
    const a = this.punto(inicio, 190);
    const b = this.punto(fin, 190);
    return `M 200 200 L ${a.x} ${a.y} A 190 190 0 0 1 ${b.x} ${b.y} Z`;
  }

  transformacionEtiqueta(indice: number): string {
    return `rotate(${indice * ANGULO_SEGMENTO} 200 200)`;
  }

  voltearEtiqueta(indice: number): string | null {
    const angulo = indice * ANGULO_SEGMENTO;
    return angulo > 90 && angulo < 270 ? 'rotate(180 200 74)' : null;
  }

  partes(etiqueta: string): [string, string] {
    const corte = etiqueta.lastIndexOf(' ');
    return [etiqueta.slice(0, corte), etiqueta.slice(corte + 1)];
  }

  private anguloDesde(evento: PointerEvent): number {
    const rectangulo = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    const centroX = rectangulo.left + rectangulo.width / 2;
    const centroY = rectangulo.top + rectangulo.height / 2;
    const radianes = Math.atan2(evento.clientX - centroX, centroY - evento.clientY);
    return mod((radianes * 180) / Math.PI, 360);
  }

  private punto(angulo: number, radio: number): { x: string; y: string } {
    const radianes = (angulo * Math.PI) / 180;
    return {
      x: (200 + radio * Math.sin(radianes)).toFixed(2),
      y: (200 - radio * Math.cos(radianes)).toFixed(2),
    };
  }
}
