import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PersonsOverviewComponent } from './persons-overview/persons-overview.component';
import { PersonCreateStepperComponent } from './person-create-stepper/person-create-stepper.component';

const routes: Routes = [
  {
    path: '',
    component: PersonsOverviewComponent,
    data: { isHome: true }
  },
  {
    path: 'create',
    component: PersonCreateStepperComponent,
    data: { previousHref: '' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonRoutingModule {}
