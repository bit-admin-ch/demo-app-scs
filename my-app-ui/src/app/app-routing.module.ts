import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QdApplicationRoleFilter, QdAuthorizationGuard } from '@quadrel-enterprise-ui/auth';
import { readQdRoleFilter } from './shared/common.constants';
import { AppPaths } from './app-routing-paths';
import { ForbiddenPageComponent } from './core/forbidden-page/forbidden-page.component';

const routes: Routes = [
  {
    path: AppPaths.Forbidden,
    component: ForbiddenPageComponent
  },
  {
    path: AppPaths.PersonsOverview,
    canActivate: [QdAuthorizationGuard],
    data: {
      roleFilter: [QdApplicationRoleFilter.hasRole(readQdRoleFilter)]
    },
    loadChildren: () => import('./person/person.module').then(m => m.PersonModule)
  },
  {
    path: '',
    redirectTo: AppPaths.Home,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: AppPaths.Home
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
