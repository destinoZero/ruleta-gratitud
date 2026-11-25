import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';
import { Ruleta } from './ruleta';

describe('Ruleta', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Ruleta],
      providers: [...appConfig.providers],
    });
  });

  it('renderiza los doce sectores', async () => {
    const fixture = TestBed.createComponent(Ruleta);
    await fixture.whenStable();
    const sectores = fixture.nativeElement.querySelectorAll('.ruleta__segmento');
    expect(sectores).toHaveLength(12);
    expect(fixture.nativeElement.querySelector('.ruleta__disco')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.ruleta__zona')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.ruleta__panel')).toBeTruthy();
  });

  it('construye la ruta de un sector y parte su etiqueta', async () => {
    const fixture = TestBed.createComponent(Ruleta);
    await fixture.whenStable();
    expect(fixture.componentInstance.rutaSegmento(0)).toContain('M 200 200');
    expect(fixture.componentInstance.partes('1 Tes. 5:18')).toEqual(['1 Tes.', '5:18']);
  });
});
