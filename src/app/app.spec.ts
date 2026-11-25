import { TestBed } from '@angular/core/testing';
import { VERSICULOS } from './data/versiculos';
import { appConfig } from './app.config';
import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers],
    });
  });

  it('muestra el título y aplica el tema otoño por defecto', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Ruleta de Gratitud');
    expect(document.documentElement.dataset['theme']).toBe('otoño');
  });

  it('recorre los tres temas al pulsar el botón', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.cambiarTema();
    expect(fixture.componentInstance.tema()).toBe('oscuro');
    fixture.componentInstance.cambiarTema();
    expect(fixture.componentInstance.tema()).toBe('claro');
    fixture.componentInstance.cambiarTema();
    expect(fixture.componentInstance.tema()).toBe('otoño');
  });

  it('muestra el pasaje RV60 en líneas y lo cierra sin cerrar la app', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;

    app.pasaje.set(VERSICULOS[8]);
    app.pasajeVisible.set(true);
    await fixture.whenStable();

    const lineas = app.lineasPasaje();
    expect(lineas).toEqual([
      'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
      'Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
    ]);
    expect(
      lineas.every(
        (linea) => !/^\d/.test(linea) && linea === linea.trim() && !/\s{2,}/.test(linea),
      ),
    ).toBe(true);
    expect(app.atribucionRv60).toContain('Reina-Valera 1960');

    app.cerrarPasaje();
    expect(app.pasajeVisible()).toBe(false);
    expect(app.pasaje()).toBe(VERSICULOS[8]);
  });

  it('muestra el confite al abrir el modal final y lo apaga a los tres segundos', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;

    app.cerrarModal();
    expect(app.confetiVisible()).toBe(false);

    app.alCompletar();
    await fixture.whenStable();
    expect(app.modalVisible()).toBe(true);
    expect(app.confetiVisible()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 3100));
    expect(app.confetiVisible()).toBe(false);

    app.cerrarModal();
    expect(app.gratitudVisible()).toBe(true);
    expect(app.confetiVisible()).toBe(false);
  });
});
