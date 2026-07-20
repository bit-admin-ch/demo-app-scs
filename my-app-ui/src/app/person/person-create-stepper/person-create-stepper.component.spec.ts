import { TestBed } from '@angular/core/testing';
import { PersonCreateStepperComponent } from './person-create-stepper.component';
import { PersonService } from '../../shared/services/person.service';
import { QdNotificationsService } from '@quadrel-enterprise-ui/framework';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe(PersonCreateStepperComponent.name, () => {
  let component: PersonCreateStepperComponent;
  let personServiceMock: any;
  let notificationsServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    personServiceMock = {
      createPerson: jest.fn()
    };

    notificationsServiceMock = {
      add: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PersonCreateStepperComponent, TranslateModule.forRoot(), StoreModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PersonService, useValue: personServiceMock },
        { provide: QdNotificationsService, useValue: notificationsServiceMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PersonCreateStepperComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  test('initializes form controls with empty values', () => {
    expect(component.personalInfos.get('firstName')?.value).toBe('');
    expect(component.personalInfos.get('lastName')?.value).toBe('');
  });

  test('validates firstName as required', () => {
    const control = component.personalInfos.get('firstName');
    control?.setValue('');
    expect(control?.valid).toBeFalsy();

    control?.setValue('Max');
    expect(control?.valid).toBeTruthy();
  });

  test('validates lastName with minLength(3)', () => {
    const control = component.personalInfos.get('lastName');
    control?.setValue('Jo');
    expect(control?.valid).toBeFalsy();

    control?.setValue('John');
    expect(control?.valid).toBeTruthy();
  });

  test('navigates to root on cancel', () => {
    (component.qdPageConfig.pageTypeConfig as { cancel: { handler: () => void } }).cancel.handler();

    expect(router.navigate).toHaveBeenCalledWith(['']);
  });

  describe('submitAction', () => {
    const formValue = { personalInfos: { firstName: 'John', lastName: 'Doe' } };

    test('calls personService.createPerson and shows success notification', () => {
      personServiceMock.createPerson.mockReturnValue(of({}));

      component.submitAction(formValue);

      expect(personServiceMock.createPerson).toHaveBeenCalledWith('John', 'Doe');
      expect(notificationsServiceMock.add).toHaveBeenCalledWith('', component.qdNotificationCreateSuccess);
    });

    test('shows error notification when createPerson fails', () => {
      personServiceMock.createPerson.mockReturnValue(throwError(() => ({ message: 'Error' })));

      component.submitAction(formValue);

      expect(notificationsServiceMock.add).toHaveBeenCalledWith('', component.qdNotificationCreateError);
    });
  });
});
