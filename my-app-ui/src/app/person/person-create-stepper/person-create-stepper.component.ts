import { Component, inject } from '@angular/core';
import {
  QdFormControl,
  QdFormInputConfiguration,
  QdFormModule,
  QdGridConfig,
  QdGridModule,
  QdNotification,
  QdNotificationsService,
  QdPageConfig,
  QdPageModule,
  QdPageStepConfig,
  QdPageStepperModule,
  QdSectionConfig,
  QdSectionModule,
  QdValidators
} from '@quadrel-enterprise-ui/framework';
import { PersonDto } from '../../shared/models/personDto';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PersonService } from '../../shared/services/person.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-create-stepper',
  templateUrl: './person-create-stepper.component.html',
  styleUrls: ['./person-create-stepper.component.scss'],
  imports: [QdPageModule, QdPageStepperModule, QdSectionModule, ReactiveFormsModule, QdGridModule, QdFormModule],
  standalone: true
})
export class PersonCreateStepperComponent {
  qdPageConfig: QdPageConfig<PersonDto> = {
    title: {
      i18n: 'i18n.create.title'
    },
    pageType: 'create',
    pageTypeConfig: {
      cancel: {
        handler: () => {
          this.router.navigate(['']);
        }
      },
      submit: {
        handler: params => this.submitAction(params)
      }
    }
  };

  qdStepOneConfig: QdPageStepConfig = {
    label: { i18n: 'i18n.create.step.one' },
    isEditable: true,
    isOptional: false
  };

  qdSectionConfig: QdSectionConfig = {
    title: {
      i18n: 'i18n.create.section.title'
    }
  };

  qdGridConfig: QdGridConfig = { columns: 6, columnsMax: 4 };

  personalInfos = new FormGroup({
    firstName: new QdFormControl('', [QdValidators.required()]),
    lastName: new QdFormControl('', [QdValidators.minLength(3)])
  });

  firstNameConfig: QdFormInputConfiguration = { label: { i18n: 'i18n.overview.table.firstname' } };
  lastNameConfig: QdFormInputConfiguration = { label: { i18n: 'i18n.overview.table.lastname' } };

  private readonly personService = inject(PersonService);
  private readonly qdNotificationsService = inject(QdNotificationsService);
  private readonly router = inject(Router);

  qdNotificationCreateSuccess: QdNotification = {
    type: 'success',
    i18n: 'i18n.person.createSuccess',
    showAsSnackbar: true
  };

  qdNotificationCreateError: QdNotification = {
    type: 'critical',
    i18n: 'i18n.person.createError',
    showAsSnackbar: true
  };

  submitAction(params: { personalInfos: { firstName: string; lastName: string } }) {
    this.personService.createPerson(params.personalInfos.firstName, params.personalInfos.lastName).subscribe({
      next: () => {
        this.qdNotificationsService.add('', this.qdNotificationCreateSuccess);
        this.router.navigate(['']);
      },
      error: () => {
        this.qdNotificationsService.add('', this.qdNotificationCreateError);
      }
    });
  }
}
