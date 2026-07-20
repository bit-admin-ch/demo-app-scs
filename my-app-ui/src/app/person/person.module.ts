import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonsOverviewComponent } from './persons-overview/persons-overview.component';
import { PersonRoutingModule } from './person-routing.module';
import { PersonCreateStepperComponent } from './person-create-stepper/person-create-stepper.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, PersonsOverviewComponent, PersonRoutingModule, PersonCreateStepperComponent]
})
export class PersonModule {}
