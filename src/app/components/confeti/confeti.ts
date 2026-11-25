import { Component } from '@angular/core';

interface Pieza {
  izquierda: number;
  retardo: number;
  duracion: number;
  color: string;
  giro: number;
}

@Component({
  selector: 'app-confeti',
  standalone: true,
  templateUrl: './confeti.html',
  styleUrl: './confeti.scss',
})
export class Confeti {
  readonly piezas: Pieza[] = Array.from({ length: 44 }, (_, indice) => ({
    izquierda: Math.random() * 100,
    retardo: Math.random() * 350,
    duracion: 1500 + Math.random() * 1100,
    color: this.color(indice),
    giro: Math.random() * 360,
  }));

  private color(indice: number): string {
    const colores = ['var(--confeti-1)', 'var(--confeti-2)', 'var(--confeti-3)', 'var(--confeti-4)'];
    return colores[indice % colores.length];
  }
}
