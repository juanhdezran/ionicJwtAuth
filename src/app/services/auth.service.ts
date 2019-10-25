import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { take, map, switchMap } from 'rxjs/operators';
import { JwtHelperService } from "@auth0/angular-jwt";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const helper = new JwtHelperService();
const TOKEN_KEY = 'jwt-token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: Observable<any>;
  private userData = new BehaviorSubject(null);

  constructor(
    private storage: Storage, 
    private http: HttpClient, 
    private plt: Platform, 
    private router: Router) {
    this.loadStoredToken();  
  }

  loadStoredToken() {
    let platformObs = from(this.plt.ready());
 
    this.user = platformObs.pipe(
      switchMap(() => {
        return from(this.storage.get(TOKEN_KEY));
      }),
      map(token => {
        if (token) {
          let decoded = helper.decodeToken(token);           
          this.userData.next(decoded);
          return true;
        } else {
          return null;
        }
      })
    );
  }

  login(credentials: {email: string, pw: string }) {
    // Normally make a POST request to your APi with your login credentials
    if (credentials.email != 'johncodes@mailinator.com' || credentials.pw != '123') {
      return of(null);
    }
 
    return this.http.get('https://randomuser.me/api/').pipe(
      take(1),
      map(res => {
        console.log('Response from randomuser', res);
        // Extract the JWT, here we just fake it
        return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkNvZGVzIiwiZW1haWwiOiJqb2huY29kZXNAbWFpbGluYXRvci5jb20ifQ.b2U_i_T3l-mmAbqyYmlh-7409ijqmNDqfGcu6JlYWfs`;
      }),
      switchMap(token => {
        let decoded = helper.decodeToken(token);
        this.userData.next(decoded);
 
        let storageObs = from(this.storage.set(TOKEN_KEY, token));
        return storageObs;
      })
    );
  }

  getUser() {
    return this.userData.getValue();
  }

  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/');
      this.userData.next(null);
    });
  }
}
