import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LANGUAGE_ENVIRONMENT } from '@quadrel-enterprise-ui/language';
import { APP_ENVIRONMENT, QdUiModule } from '@quadrel-enterprise-ui/framework';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { QdAuthModule } from '@quadrel-enterprise-ui/auth';
import { appEnvironment, appSetup, authConfig } from '../environments/environment';

import { registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import localeENCH from '@angular/common/locales/en-CH';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { PersonModule } from './person/person.module';
import { CoreModule } from './core/core.module';

export function createTranslateLoader(httpClient: HttpClient) {
  return new MultiTranslateHttpLoader(httpClient, [
    { prefix: './assets/i18n/', suffix: '.json' },
    { prefix: './assets/i18n/qd-ui/', suffix: '.json' }
  ]);
}

registerLocaleData(localeDECH);
registerLocaleData(localeENCH);
registerLocaleData(localeFRCH);
registerLocaleData(localeITCH);

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument(),
    QdAuthModule.forRoot(appSetup, authConfig),
    QdUiModule.forRoot(appEnvironment),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    CoreModule,
    PersonModule
  ],
  exports: [QdAuthModule],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: LANGUAGE_ENVIRONMENT,
      useValue: appEnvironment
    },
    {
      provide: APP_ENVIRONMENT,
      useValue: appEnvironment
    }
  ]
})
export class AppModule {}
