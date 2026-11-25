import { TestBed } from '@angular/core/testing';
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
});
