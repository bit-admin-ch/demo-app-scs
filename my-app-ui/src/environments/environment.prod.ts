import { QdAppEnvironment } from '@quadrel-enterprise-ui/framework';
import { QdAppSetup, QdAuthConfigServerSide, QdLogLevel } from '@quadrel-enterprise-ui/auth';

export const appSetup: QdAppSetup = {
  production: true,
  serviceEndpoint: '/my-app/'
};

export const authConfig: QdAuthConfigServerSide = {
  configPathSegment: 'ui-api/configuration/auth',
  clientId: 'my-app',
  systemName: 'demo',
  logLevel: QdLogLevel.Debug,
  renewUserInfoAfterTokenRenew: true,
  silentRenew: true,
  silentRenewUrl: `${window.location.origin}/my-app/assets/auth/silent-renew.html`,
  useAutoLogin: true
};

export const appEnvironment: QdAppEnvironment = {
  production: appSetup.production,
  BACKEND_SERVICE_API: appSetup.serviceEndpoint,
  CONFIGURATION_PATH: 'ui-api/configuration/auth'
};
