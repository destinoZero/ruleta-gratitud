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

    expect(app.lineasPasaje()).toHaveLength(2);
    expect(app.lineasPasaje()[0]).toContain('Por nada estéis afanosos');
    expect(app.atribucionRv60).toContain('Reina-Valera 1960');

    app.cerrarPasaje();
    expect(app.pasajeVisible()).toBe(false);
    expect(app.pasaje()).toBe(VERSICULOS[8]);
  });
});
