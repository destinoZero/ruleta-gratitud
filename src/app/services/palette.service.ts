import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaletteService {
  generar(cantidad = 12): string[] {
    const inicio = Math.random() * 360;
    const colores = Array.from({ length: cantidad }, (_, indice) => {
      const tono = mod(inicio + indice * (360 / cantidad) + (Math.random() * 10 - 5), 360);
      const saturacion = 68 + Math.random() * 12;
      const luminosidad = 83 + Math.random() * 4;
      return `hsl(${tono.toFixed(1)} ${saturacion.toFixed(1)}% ${luminosidad.toFixed(1)}%)`;
    });
    return this.mezclar(colores);
  }

  private mezclar<T>(valores: T[]): T[] {
    const resultado = [...valores];
    for (let i = resultado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
  }
}

function mod(valor: number, modulo: number): number {
  return ((valor % modulo) + modulo) % modulo;
}
