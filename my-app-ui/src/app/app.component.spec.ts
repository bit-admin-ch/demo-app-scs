import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { QdDialogAuthSessionEndService } from '@quadrel-enterprise-ui/framework';
import { QdAuthenticationService, QdConfigService } from '@quadrel-enterprise-ui/auth';
import { VersionService } from './shared/services/version.service';
import { BehaviorSubject, of } from 'rxjs';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe(AppComponent.name, () => {
  let component: AppComponent;
  let versionServiceMock: any;
  let qdConfigServiceMock: any;
  let qdAuthenticationServiceMock: any;
  let authSupportMock: any;
  let versionSubject: BehaviorSubject<string | null>;
  let configSubject: BehaviorSubject<Record<string, unknown>>;

  beforeEach(async () => {
    versionSubject = new BehaviorSubject<string | null>(null);
    configSubject = new BehaviorSubject<Record<string, unknown>>({});

    versionServiceMock = {
      version$: versionSubject.asObservable(),
      fetchVersion: jest.fn()
    };

    qdConfigServiceMock = {
      config$: configSubject.asObservable()
    };

    qdAuthenticationServiceMock = {
      registerBeforeSessionLogoutHandler: jest.fn()
    };

    authSupportMock = {
      getLogoutHandler: jest.fn().mockReturnValue(() => {})
    };

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [TranslateModule.forRoot(), StoreModule.forRoot()],
      providers: [
        { provide: VersionService, useValue: versionServiceMock },
        { provide: QdConfigService, useValue: qdConfigServiceMock },
        { provide: QdAuthenticationService, useValue: qdAuthenticationServiceMock },
        { provide: QdDialogAuthSessionEndService, useValue: authSupportMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('sets initial qdShellConfig with default values', () => {
    expect((component.qdShellConfig.title as { i18n: string })?.i18n).toBe('i18n.application.title');
    expect(component.qdShellConfig.serviceNavigation?.pamsAppId).toBe('notSet');
  });

  test('calls fetchVersion on init', () => {
    expect(versionServiceMock.fetchVersion).toHaveBeenCalled();
  });

  test('registers logout handler on init', () => {
    expect(authSupportMock.getLogoutHandler).toHaveBeenCalled();
    expect(qdAuthenticationServiceMock.registerBeforeSessionLogoutHandler).toHaveBeenCalled();
  });

  test('updates copyrightInfo when version is emitted', () => {
    versionSubject.next('2.0.0');

    expect(component.qdShellConfig.copyrightInfo?.i18n).toContain('2.0.0');
    expect(component.qdShellConfig.copyrightInfo?.showYear).toBe(true);
  });

  test('does not update copyrightInfo when version is null', () => {
    versionSubject.next(null);

    expect(component.qdShellConfig.copyrightInfo).toBeUndefined();
  });

  test('updates pamsAppId when config emits pamsAppId', () => {
    configSubject.next({ pamsAppId: 'myApp' });

    expect(component.qdShellConfig.serviceNavigation?.pamsAppId).toBe('myApp');
  });

  test('does not update pamsAppId when config has no pamsAppId', () => {
    configSubject.next({ otherKey: 'value' });

    expect(component.qdShellConfig.serviceNavigation?.pamsAppId).toBe('notSet');
  });

  test('unsubscribes on destroy', () => {
    versionSubject.next('2.0.0');
    expect(component.qdShellConfig.copyrightInfo?.i18n).toContain('2.0.0');

    component.ngOnDestroy();

    // After destroy, further emissions should not update the config
    versionSubject.next('3.0.0');
    expect(component.qdShellConfig.copyrightInfo?.i18n).toContain('2.0.0');
  });
});
