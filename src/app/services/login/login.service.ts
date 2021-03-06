import { apConfig } from './../../../global';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { filter } from 'rxjs/operators';
import * as auth0 from 'auth0-js';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {

  auth0 = new auth0.WebAuth({
    clientID: '6g2cmkUcCIinLOJHdzp42RyV4H2EnyRS',
    domain: 'bss2018.eu.auth0.com',
    responseType: 'token id_token',
    audience: 'https://bss2018.eu.auth0.com/userinfo',
    redirectUri: 'http://localhost:4200',
    scope: 'openid'
  });

  private apiLoginUrl = apConfig.API_ENDPOINT_URL + '/login';

  constructor(public router: Router) {}


  public login(): void {
    this.auth0.authorize();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        console.log('authResult: ', authResult);
        this.setSession(authResult);
        this.router.navigate(['/profile']);
      } else if (err) {
        this.router.navigate(['/profile']);
        console.log(err);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    console.log('Does Code Goes Here');
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}
