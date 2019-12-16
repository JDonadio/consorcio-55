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
        'Authorization': 'Bearer Q6sjVJRXkeAAAAAAAAAFYuO18T-fRiX0YsTexZgm7BCREwifBSk70fd1eCzZRgkI'
      },
    });

    return next.handle(req);
  }
}