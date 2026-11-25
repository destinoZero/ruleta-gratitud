import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideServiceWorker } from '@angular/service-worker';
import {
  BgColorsOutline,
  CheckOutline,
  DownloadOutline,
  HeartOutline,
  RedoOutline,
  ReloadOutline,
  ShareAltOutline,
  AudioMutedOutline,
  AudioOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNzI18n(es_ES),
    provideNzDateFnsAdapter(),
    provideNzIcons([
      BgColorsOutline,
      CheckOutline,
      DownloadOutline,
      HeartOutline,
      RedoOutline,
      ReloadOutline,
      ShareAltOutline,
      AudioMutedOutline,
      AudioOutline,
    ]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
