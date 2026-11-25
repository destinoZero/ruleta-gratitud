export interface Versiculo {
  readonly id: number;
  readonly referencia: string;
  readonly etiqueta: string;
  readonly textoRv60: string;
}

export type FaseRuleta = 'idle' | 'dragging' | 'spinning' | 'snapping' | 'skipping' | 'done';

export interface Segmento {
  readonly indice: number;
  readonly etiqueta: string;
  readonly color: string;
  readonly usado: boolean;
}
