import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appSetup } from '../../../environments/environment';
import { PersonDto } from '../models/personDto';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private static readonly url: string = appSetup.serviceEndpoint + 'ui-api/';

  private readonly httpClient = inject(HttpClient);

  getPersons(): Observable<PersonDto[]> {
    return this.httpClient.get<PersonDto[]>(PersonService.url + 'persons');
  }

  createPerson(firstname: string, lastname: string): Observable<PersonDto> {
    const params = new HttpParams().set('firstname', firstname).set('lastname', lastname);

    return this.httpClient.post<PersonDto>(PersonService.url + 'persons', null, {
      params: params,
      responseType: 'json'
    });
  }

  deletePerson(personId: string): Observable<void> {
    return this.httpClient.delete<void>(PersonService.url + `persons/${personId}`);
  }
}
