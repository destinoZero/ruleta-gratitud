class ParametroMock {
  setValueAtTime(): this {
    return this;
  }

  exponentialRampToValueAtTime(): this {
    return this;
  }
}

class NodoMock {
  frequency = new ParametroMock();
  gain = new ParametroMock();

  connect(): this {
    return this;
  }

  start(): void {}

  stop(): void {}
}

class AudioContextMock {
  state = 'running';
  currentTime = 0;
  destination = {} as AudioDestinationNode;

  createOscillator(): OscillatorNode {
    return new NodoMock() as unknown as OscillatorNode;
  }

  createGain(): GainNode {
    return new NodoMock() as unknown as GainNode;
  }

  async resume(): Promise<void> {}
}

Object.defineProperty(globalThis, 'AudioContext', { value: AudioContextMock, writable: true });

Object.defineProperty(navigator, 'vibrate', { value: jest.fn(() => true), writable: true });
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: jest.fn(async () => undefined) },
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({ matches: false, addListener: jest.fn(), removeListener: jest.fn() })),
  writable: true,
});

Object.defineProperty(globalThis, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 16) as unknown as number,
  writable: true,
});

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  value: (id: number) => clearTimeout(id),
  writable: true,
});
