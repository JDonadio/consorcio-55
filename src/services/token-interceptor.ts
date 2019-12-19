import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {
        'Authorization': 'Bearer Q6sjVJRXkeAAAAAAAAAFbts9U3jASQCVqXM5035HjTVWGRZOtFvw7tc7t4UK811l'
      },
    });

    return next.handle(req);
  }
}