import { TestBed } from '@angular/core/testing';
import { FeedbackService } from './feedback.service';
import { PaletteService } from './palette.service';
import {
  FRICCION,
  VELOCIDAD_MAX,
  WheelEngine,
  diferenciaCorta,
  indiceEn,
  siguienteLibre,
} from './wheel-engine.service';

describe('WheelEngine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(PaletteService.prototype, 'generar').mockReturnValue(
      Array.from({ length: 12 }, (_, indice) => `hsl(${indice * 30} 70% 85%)`),
    );
    TestBed.configureTestingModule({ providers: [WheelEngine, PaletteService, FeedbackService] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('identifica el sector situado bajo el puntero', () => {
    expect(indiceEn(0)).toBe(0);
    expect(indiceEn(-30)).toBe(1);
    expect(indiceEn(-330)).toBe(11);
  });

  it('calcula la diferencia angular más corta', () => {
    expect(diferenciaCorta(350, 10)).toBe(20);
    expect(diferenciaCorta(10, 350)).toBe(-20);
  });

  it('busca hacia la derecha el primer sector libre', () => {
    expect(siguienteLibre(0, [0, 1, 2])).toBe(3);
    expect(siguienteLibre(11, [0, 11])).toBe(1);
  });

  it('detiene un empujón máximo a los 5 segundos', () => {
    expect(VELOCIDAD_MAX / FRICCION).toBeCloseTo(5000, 5);
  });

  it('muestra los 12 pasajes una sola vez', () => {
    const engine = TestBed.inject(WheelEngine);
    for (let intento = 0; intento < 12; intento++) {
      engine.girar();
      jest.advanceTimersByTime(6000);
      expect(engine.dibujados().length).toBe(intento + 1);
    }
    expect(new Set(engine.dibujados()).size).toBe(12);
    expect(engine.fase()).toBe('done');
    expect(engine.resultado()?.referencia).toBeTruthy();
  });

  it('reinicia el estado sin conservar pasajes', () => {
    const engine = TestBed.inject(WheelEngine);
    engine.girar();
    jest.advanceTimersByTime(6000);
    engine.reiniciar();
    expect(engine.dibujados()).toHaveLength(0);
    expect(engine.resultado()).toBeNull();
    expect(engine.fase()).toBe('idle');
    expect(engine.colores()).toHaveLength(12);
  });
});
