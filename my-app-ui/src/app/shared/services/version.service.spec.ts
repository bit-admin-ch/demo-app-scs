import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VersionService } from './version.service';

describe(VersionService.name, () => {
  let service: VersionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), VersionService]
    });
    service = TestBed.inject(VersionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  test('exposes null as initial version', () => {
    expect(service.getVersion()).toBeNull();
  });

  describe('fetchVersion', () => {
    test('fetches version as text and updates BehaviorSubject', () => {
      const versions: (string | null)[] = [];
      service.version$.subscribe(v => versions.push(v));

      service.fetchVersion();

      const req = httpMock.expectOne(req => req.url.endsWith('ui-api/configuration/version'));
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('text');
      req.flush('1.2.3');

      expect(service.getVersion()).toBe('1.2.3');
      expect(versions).toEqual([null, '1.2.3']);
    });

    test('keeps version null on HTTP error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.fetchVersion();

      const req = httpMock.expectOne(req => req.url.endsWith('ui-api/configuration/version'));
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(service.getVersion()).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
