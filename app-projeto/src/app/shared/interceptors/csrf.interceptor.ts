import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, filter, map, switchMap, take } from 'rxjs';

const API_PREFIX = 'http://localhost:8080/api/';
const CSRF_URL = `${API_PREFIX}auth/csrf`;

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_PREFIX)) {
    return next(request);
  }

  const apiRequest = request.clone({ withCredentials: true });
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(request.method)) {
    return next(apiRequest);
  }

  return getCsrfToken(next).pipe(
    switchMap(token => next(apiRequest.clone({
      setHeaders: { 'X-XSRF-TOKEN': token }
    })))
  );
};

function getCsrfToken(next: HttpHandlerFn): Observable<string> {
  const csrfRequest = new HttpRequest('GET', CSRF_URL, { withCredentials: true });
  return next(csrfRequest).pipe(
    filter((event): event is HttpResponse<{ token: string }> => event instanceof HttpResponse),
    take(1),
    map(response => {
      const token = response.body?.token;
      if (!token) {
        throw new Error('A resposta do endpoint CSRF não contém um token.');
      }
      return token;
    })
  );
}
