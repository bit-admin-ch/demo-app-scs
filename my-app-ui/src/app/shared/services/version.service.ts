import { inject, Injectable } from '@angular/core';
import { appSetup } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly versionUrl: string = appSetup.serviceEndpoint + 'ui-api/configuration/version';

  // BehaviorSubject to store the version and allow subscriptions
  private readonly versionSubject = new BehaviorSubject<string | null>(null);
  // Expose version$ as observable
  public version$ = this.versionSubject.asObservable();

  private readonly http = inject(HttpClient);

  // Fetch version from server
  fetchVersion() {
    this.http
      .get(this.versionUrl, { responseType: 'text' }) // Expect plain text response
      .pipe(
        catchError(error => {
          console.error('Error fetching version:', error);
          return throwError(() => new Error('Error fetching version.'));
        })
      )
      .subscribe({
        next: version => this.versionSubject.next(version), // Update the BehaviorSubject with the version
        error: err => console.error('Error in subscription:', err)
      });
  }

  // Get the latest version as a BehaviorSubject value
  getVersion() {
    return this.versionSubject.value;
  }
}
