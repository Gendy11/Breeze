import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { InitService } from './core/services/init.service';
import { lastValueFrom } from 'rxjs';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),
    provideAppInitializer(async () => {
      const initService = inject(InitService);
      return lastValueFrom(initService.init()).finally(() => {
        console.log('cart fetched')
        const splash = document.getElementById('initial-splash');
        if (splash) {
          splash.remove();
        }
      })
    }),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue:{autoFocus:'dialog',restoreFocus:true}
    }
  ]
};
