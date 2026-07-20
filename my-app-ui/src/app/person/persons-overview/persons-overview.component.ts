import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  QdNotification,
  QdNotificationsService,
  QdPageConfig,
  QdPageModule,
  QdSectionConfig,
  QdSectionModule,
  QdTableConfig,
  QdTableData,
  QdTableModule,
  QdTableRecentSecondaryAction
} from '@quadrel-enterprise-ui/framework';
import { map, Subscription } from 'rxjs';
import { PersonService } from '../../shared/services/person.service';
import { PersonDto } from '../../shared/models/personDto';
import { Router } from '@angular/router';
import { QdAuthorizationService } from '@quadrel-enterprise-ui/auth';
import { writeQdRoleFilter } from '../../shared/common.constants';

type tableColumns = 'lastname' | 'firstname' | 'id';

@Component({
  selector: 'app-persons-overview',
  templateUrl: './persons-overview.component.html',
  styleUrls: ['./persons-overview.component.scss'],
  imports: [CommonModule, QdSectionModule, QdTableModule, QdPageModule],
  standalone: true
})
export class PersonsOverviewComponent implements OnInit, OnDestroy {
  qdPageConfig: QdPageConfig = {
    title: {
      i18n: 'i18n.overview.title'
    },
    pageType: 'overview'
  };

  qdSectionConfig: QdSectionConfig = {
    title: {
      i18n: 'i18n.overview.section.title'
    },
    action: {
      i18n: 'i18n.overview.section.addBtn',
      type: 'addNew'
    }
  };

  qdTableData?: QdTableData<tableColumns>;

  qdTableConfig: QdTableConfig<tableColumns> = {
    columns: [
      {
        column: 'firstname',
        type: 'text'
      },
      {
        column: 'lastname',
        type: 'text'
      },
      {
        column: 'id',
        type: 'text'
      }
    ],
    secondaryActions: [
      {
        type: 'delete',
        handler: selectedRow => this.deletePerson(selectedRow)
      }
    ],
    i18ns: 'i18n.overview.table'
  };

  qdNotificationInsufficientPermissions: QdNotification = {
    type: 'critical',
    i18n: 'i18n.error.insufficientPermissions',
    showAsSnackbar: true
  };

  qdNotificationDeleteSuccess: QdNotification = {
    type: 'success',
    i18n: 'i18n.person.deleteSuccess',
    showAsSnackbar: true
  };

  qdNotificationDeleteError: QdNotification = {
    type: 'critical',
    i18n: 'i18n.person.deleteError',
    showAsSnackbar: true
  };

  personSubscription$?: Subscription;
  hasWriteRoleSubscription$?: Subscription;

  private readonly personService = inject(PersonService);
  private readonly qdAuthorizationService = inject(QdAuthorizationService);
  private readonly qdNotificationsService = inject(QdNotificationsService);
  private readonly router = inject(Router);

  hasWriteRole: boolean | undefined;

  ngOnInit(): void {
    this.getAllPersons();
    this.hasWriteRoleSubscription$ = this.qdAuthorizationService
      .hasRole(writeQdRoleFilter)
      .subscribe(value => (this.hasWriteRole = value));
  }

  ngOnDestroy(): void {
    this.personSubscription$?.unsubscribe();
    this.hasWriteRoleSubscription$?.unsubscribe();
  }

  getAllPersons(): void {
    this.personSubscription$ = this.personService
      .getPersons()
      .pipe(map(value => this.mapPersonArrayToTableData(value)))
      .subscribe(data => (this.qdTableData = data));
  }

  private mapPersonArrayToTableData(response: PersonDto[]): QdTableData<tableColumns> {
    return response.map(person => ({
      firstname: person.firstname,
      lastname: person.lastname,
      id: person.id
    }));
  }

  addNewPerson(): void {
    if (this.hasWriteRole) {
      this.router.navigate(['/create']);
    } else {
      this.qdNotificationsService.add('', this.qdNotificationInsufficientPermissions);
    }
  }

  deletePerson($event: QdTableRecentSecondaryAction<tableColumns>): void {
    if (this.hasWriteRole) {
      this.personService.deletePerson($event.rowData['id'] as string).subscribe({
        next: () => {
          this.getAllPersons();
          this.qdNotificationsService.add('', this.qdNotificationDeleteSuccess);
        },
        error: () => {
          this.qdNotificationsService.add('', this.qdNotificationDeleteError);
        }
      });
    } else {
      this.qdNotificationsService.add('', this.qdNotificationInsufficientPermissions);
    }
  }
}
