import {
  DOCUMENT,
  HostListener,
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Confeti } from './components/confeti/confeti';
import { Ruleta } from './components/ruleta/ruleta';
import { RV60_ATRIBUCION } from './data/versiculos';
import { Versiculo } from './models/wheel.model';
import { WheelEngine } from './services/wheel-engine.service';

type Tema = 'claro' | 'otoño' | 'oscuro';

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzModalModule, Ruleta, Confeti],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild(Ruleta) private ruleta?: Ruleta;

  private readonly document = inject(DOCUMENT);
  private readonly engine = inject(WheelEngine);
  private readonly temas: readonly Tema[] = ['claro', 'otoño', 'oscuro'];
  private eventoInstalacion?: EventoInstalacion;
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly tema = signal<Tema>('otoño');
  readonly etiquetaTema = computed(
    () => ({ claro: 'Claro', otoño: 'Otoño', oscuro: 'Oscuro' })[this.tema()],
  );
  readonly instalable = signal(false);
  readonly modalVisible = signal(false);
  readonly gratitudVisible = signal(false);
  readonly confetiVisible = signal(false);
  readonly pasaje = signal<Versiculo | null>(null);
  readonly pasajeVisible = signal(false);
  readonly atribucionRv60 = RV60_ATRIBUCION;
  readonly lineasPasaje = computed(() => this.pasaje()?.textoRv60.split('\n') ?? []);

  private finalPendiente = false;

  constructor() {
    effect(() => {
      const tema = this.tema();
      this.document.documentElement.dataset['theme'] = tema;
      const colores: Record<Tema, string> = {
        claro: '#2563eb',
        otoño: '#c2410c',
        oscuro: '#171312',
      };
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', colores[tema]);
    });

    effect(() => {
      const versiculo = this.engine.resultado();
      this.pasaje.set(versiculo);
      this.pasajeVisible.set(versiculo !== null);
    });
  }

  cambiarTema(): void {
    const indice = this.temas.indexOf(this.tema());
    this.tema.set(this.temas[(indice + 1) % this.temas.length]);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  alAntesInstalar(evento: Event): void {
    evento.preventDefault();
    this.eventoInstalacion = evento as EventoInstalacion;
    this.instalable.set(true);
  }

  async instalar(): Promise<void> {
    if (!this.eventoInstalacion) return;
    await this.eventoInstalacion.prompt();
    await this.eventoInstalacion.userChoice;
    this.instalable.set(false);
    this.eventoInstalacion = undefined;
  }

  alCompletar(): void {
    this.finalPendiente = true;
    if (!this.engine.resultado()) this.mostrarFinal();
  }

  cerrarPasaje(): void {
    this.pasajeVisible.set(false);
    if (!this.finalPendiente) return;
    this.finalPendiente = false;
    this.mostrarFinal();
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.gratitudVisible.set(true);
    this.confetiVisible.set(true);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.confetiVisible.set(false), 2600);
  }

  reiniciar(): void {
    this.ruleta?.reiniciar();
    this.modalVisible.set(false);
    this.gratitudVisible.set(false);
    this.confetiVisible.set(false);
    this.pasajeVisible.set(false);
    this.pasaje.set(null);
    this.finalPendiente = false;
    clearTimeout(this.temporizador);
  }

  private mostrarFinal(): void {
    this.modalVisible.set(true);
    this.gratitudVisible.set(false);
  }
}
