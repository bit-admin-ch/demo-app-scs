import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { QdDialogAuthSessionEndService, QdShellConfig } from '@quadrel-enterprise-ui/framework';
import { QdAuthenticationService, QdConfigService } from '@quadrel-enterprise-ui/auth';
import { VersionService } from './shared/services/version.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly qdAuthenticationService = inject(QdAuthenticationService);
  private readonly translateService = inject(TranslateService);
  private readonly authSupport = inject(QdDialogAuthSessionEndService);
  private readonly qdConfigService = inject(QdConfigService);
  private readonly versionService = inject(VersionService);

  private versionSubscription$?: Subscription;
  private configSubscription$?: Subscription;

  qdShellConfig: QdShellConfig = {
    title: {
      i18n: 'i18n.application.title'
    },
    hasSearch: false,
    isInternal: true,
    headerWidget: {
      isDisabled: true
    },
    serviceNavigation: {
      isDisabled: true,
      pamsAppId: 'notSet',
      languageList: ['de', 'fr', 'it', 'en'],
      infoLinks: [
        {
          i18n: 'i18n.error.success',
          href: '/success'
        },
        {
          i18n: 'i18n.error.info',
          hrefs: {
            de: '/info/de',
            fr: '/info/fr',
            it: '/info/it',
            en: '/info/en'
          }
        }
      ],
      isInfoActive: true,
      showLanguages: true,
      showNotifications: true,
      showEportalServices: true,
      showProfile: true
    }
  };

  ngOnInit(): void {
    this.translateService.setFallbackLang('de');
    this.translateService.use('de');

    this.versionSubscription$ = this.versionService.version$.subscribe(version => {
      if (version) {
        this.qdShellConfig = {
          ...this.qdShellConfig,
          copyrightInfo: {
            i18n: 'Powered by jEAP and Quadrel - Generated with jEAP Initializer. Version: ' + version,
            showYear: true
          }
        };
      }
    });

    this.versionService.fetchVersion();

    this.configSubscription$ = this.qdConfigService.config$.subscribe(config => {
      const pamsAppId = (config as unknown as Record<string, unknown>)['pamsAppId'] as string | undefined;
      if (pamsAppId) {
        this.qdShellConfig = {
          ...this.qdShellConfig,
          serviceNavigation: {
            ...this.qdShellConfig.serviceNavigation!,
            pamsAppId
          }
        };
      }
    });

    this.qdAuthenticationService.registerBeforeSessionLogoutHandler(this.authSupport.getLogoutHandler());
  }

  ngOnDestroy(): void {
    this.versionSubscription$?.unsubscribe();
    this.configSubscription$?.unsubscribe();
  }
}
