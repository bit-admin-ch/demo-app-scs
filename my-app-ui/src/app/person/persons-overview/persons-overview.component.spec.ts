import { TestBed } from '@angular/core/testing';
import { PersonsOverviewComponent } from './persons-overview.component';
import { PersonService } from '../../shared/services/person.service';
import { QdAuthorizationService } from '@quadrel-enterprise-ui/auth';
import { QdNotificationsService } from '@quadrel-enterprise-ui/framework';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe(PersonsOverviewComponent.name, () => {
  let component: PersonsOverviewComponent;
  let personServiceMock: any;
  let authorizationServiceMock: any;
  let notificationsServiceMock: any;
  let router: Router;

  const mockPersons = [
    { id: '1', firstname: 'Max', lastname: 'Muster' },
    { id: '2', firstname: 'Anna', lastname: 'Beispiel' }
  ];

  beforeEach(async () => {
    personServiceMock = {
      getPersons: jest.fn().mockReturnValue(of(mockPersons)),
      deletePerson: jest.fn()
    };

    authorizationServiceMock = {
      hasRole: jest.fn().mockReturnValue(of(true))
    };

    notificationsServiceMock = {
      add: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PersonsOverviewComponent, TranslateModule.forRoot(), StoreModule.forRoot()],
      providers: [
        provideRouter([{ path: 'create', component: PersonsOverviewComponent }]),
        { provide: PersonService, useValue: personServiceMock },
        { provide: QdAuthorizationService, useValue: authorizationServiceMock },
        { provide: QdNotificationsService, useValue: notificationsServiceMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PersonsOverviewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  test('loads persons on init', () => {
    expect(personServiceMock.getPersons).toHaveBeenCalled();
    expect(component.qdTableData).toEqual([
      { firstname: 'Max', lastname: 'Muster', id: '1' },
      { firstname: 'Anna', lastname: 'Beispiel', id: '2' }
    ]);
  });

  test('checks write role on init', () => {
    expect(authorizationServiceMock.hasRole).toHaveBeenCalled();
    expect(component.hasWriteRole).toBe(true);
  });

  describe('addNewPerson', () => {
    test('navigates to /create when user has write role', () => {
      component.hasWriteRole = true;
      component.addNewPerson();
      expect(router.navigate).toHaveBeenCalledWith(['/create']);
    });

    test('shows notification when user lacks write role', () => {
      component.hasWriteRole = false;
      component.addNewPerson();
      expect(notificationsServiceMock.add).toHaveBeenCalledWith('', component.qdNotificationInsufficientPermissions);
    });
  });

  describe('deletePerson', () => {
    test('deletes person and shows success notification when user has write role', () => {
      component.hasWriteRole = true;
      personServiceMock.deletePerson.mockReturnValue(of(null));

      component.deletePerson({ type: 'delete', index: 0, rowData: { id: '1' } });

      expect(personServiceMock.deletePerson).toHaveBeenCalledWith('1');
      expect(personServiceMock.getPersons).toHaveBeenCalledTimes(2);
      expect(notificationsServiceMock.add).toHaveBeenCalledWith('', component.qdNotificationDeleteSuccess);
    });

    test('shows notification when user lacks write role', () => {
      component.hasWriteRole = false;
      component.deletePerson({ type: 'delete', index: 0, rowData: { id: '1' } });

      expect(personServiceMock.deletePerson).not.toHaveBeenCalled();
      expect(notificationsServiceMock.add).toHaveBeenCalledWith('', component.qdNotificationInsufficientPermissions);
    });

    test('shows error notification when delete fails', () => {
      component.hasWriteRole = true;
      personServiceMock.deletePerson.mockReturnValue(throwError(() => ({ message: 'Error' })));

      component.deletePerson({ type: 'delete', index: 0, rowData: { id: '1' } });

      expect(notificationsServiceMock.add).toHaveBeenCalledWith('', component.qdNotificationDeleteError);
    });
  });

  describe('ngOnDestroy', () => {
    test('unsubscribes from all subscriptions', () => {
      const personSub = component.personSubscription$!;
      const roleSub = component.hasWriteRoleSubscription$!;
      jest.spyOn(personSub, 'unsubscribe');
      jest.spyOn(roleSub, 'unsubscribe');

      component.ngOnDestroy();

      expect(personSub.unsubscribe).toHaveBeenCalled();
      expect(roleSub.unsubscribe).toHaveBeenCalled();
    });
  });
});
