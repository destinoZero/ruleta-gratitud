import { TestBed } from '@angular/core/testing';
import { RV60_ATRIBUCION, VERSICULOS } from '../data/versiculos';
import { FeedbackService } from './feedback.service';
import { PaletteService } from './palette.service';
import {
  ANGULO_SEGMENTO,
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
    jest
      .spyOn(PaletteService.prototype, 'generar')
      .mockReturnValue(Array.from({ length: 12 }, (_, indice) => `hsl(${indice * 30} 70% 85%)`));
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

  it('busca el primer sector libre en la dirección indicada', () => {
    expect(siguienteLibre(0, [0, 1, 2])).toBe(3);
    expect(siguienteLibre(11, [0, 11])).toBe(1);
    expect(siguienteLibre(0, [0, 11, 10], -1)).toBe(9);
    expect(siguienteLibre(11, [0, 11], -1)).toBe(10);
  });

  it('salta en el sentido visual positivo y abre el sector mostrado', () => {
    const engine = TestBed.inject(WheelEngine);
    const interno = engine as unknown as {
      rotacion: { set(valor: number): void };
      dibujados: { set(valor: readonly number[]): void };
      direccion: 1 | -1;
      snap(): void;
    };

    interno.dibujados.set([5, 4, 3]);
    interno.rotacion.set(-5 * ANGULO_SEGMENTO);
    interno.direccion = 1;
    interno.snap();
    jest.advanceTimersByTime(6000);

    expect(engine.resultado()).toBe(VERSICULOS[2]);
    expect(indiceEn(engine.rotacion())).toBe(2);
  });

  it('salta en el sentido visual negativo y abre el sector mostrado', () => {
    const engine = TestBed.inject(WheelEngine);
    const interno = engine as unknown as {
      rotacion: { set(valor: number): void };
      dibujados: { set(valor: readonly number[]): void };
      direccion: 1 | -1;
      snap(): void;
    };

    interno.dibujados.set([5, 6, 7]);
    interno.rotacion.set(-5 * ANGULO_SEGMENTO);
    interno.direccion = -1;
    interno.snap();
    jest.advanceTimersByTime(6000);

    expect(engine.resultado()).toBe(VERSICULOS[8]);
    expect(indiceEn(engine.rotacion())).toBe(8);
  });

  it('gira hacia la derecha con el botón y respeta el sentido del arrastre', () => {
    const engine = TestBed.inject(WheelEngine);

    engine.girar();
    jest.advanceTimersByTime(100);
    expect(engine.rotacion()).toBeGreaterThan(0);

    engine.reiniciar();
    engine.iniciarArrastre(0, 0);
    engine.moverArrastre(30, 100);
    expect(engine.rotacion()).toBe(30);

    engine.reiniciar();
    engine.iniciarArrastre(0, 0);
    engine.moverArrastre(-30, 100);
    expect(engine.rotacion()).toBe(-30);
  });

  it('incluye el texto RV60 y la atribución en los doce pasajes', () => {
    expect(VERSICULOS).toHaveLength(12);
    expect(VERSICULOS.every((versiculo) => versiculo.textoRv60.trim().length > 20)).toBe(true);
    expect(RV60_ATRIBUCION).toContain('Reina-Valera 1960');
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
