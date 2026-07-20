import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PersonService } from './person.service';
import { PersonDto } from '../models/personDto';

describe(PersonService.name, () => {
  let service: PersonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PersonService]
    });
    service = TestBed.inject(PersonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPersons', () => {
    test('returns persons via GET /ui-api/persons', () => {
      const mockPersons: PersonDto[] = [
        { id: '1', firstname: 'Max', lastname: 'Muster' },
        { id: '2', firstname: 'Anna', lastname: 'Beispiel' }
      ];

      service.getPersons().subscribe(persons => {
        expect(persons).toEqual(mockPersons);
        expect(persons.length).toBe(2);
      });

      const req = httpMock.expectOne(req => req.url.endsWith('ui-api/persons'));
      expect(req.request.method).toBe('GET');
      req.flush(mockPersons);
    });
  });

  describe('createPerson', () => {
    test('sends POST to /ui-api/persons with firstname and lastname as query params', () => {
      service.createPerson('Max', 'Muster').subscribe(person => {
        expect(person).toBeTruthy();
      });

      const req = httpMock.expectOne(req => req.url.endsWith('ui-api/persons') && req.method === 'POST');
      expect(req.request.params.get('firstname')).toBe('Max');
      expect(req.request.params.get('lastname')).toBe('Muster');
      req.flush({ id: '3', firstname: 'Max', lastname: 'Muster' });
    });
  });

  describe('deletePerson', () => {
    test('sends DELETE to /ui-api/persons/{id}', () => {
      service.deletePerson('42').subscribe();

      const req = httpMock.expectOne(req => req.url.endsWith('ui-api/persons/42'));
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
