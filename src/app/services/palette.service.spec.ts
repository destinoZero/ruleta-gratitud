import { TestBed } from '@angular/core/testing';
import { PaletteService } from './palette.service';

describe('PaletteService', () => {
  let servicio: PaletteService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PaletteService] });
    servicio = TestBed.inject(PaletteService);
  });

  it('genera doce colores pastel', () => {
    const colores = servicio.generar(12);
    expect(colores).toHaveLength(12);
    colores.forEach(color => expect(color).toMatch(/^hsl\(/));
  });

  it('mezcla los colores para que no queden en orden de tono', () => {
    const colores = servicio.generar(12);
    const tonos = colores.map(color => Number(color.match(/hsl\(([\d.]+)/)?.[1]));
    expect(new Set(tonos).size).toBeGreaterThan(6);
  });
});
