/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpCustomInterceptor } from './http-custom-interceptor.component';

/** Http interceptor providers in outside-in order */
export const HttpInterceptorProviders = [{ provide: HTTP_INTERCEPTORS, useClass: HttpCustomInterceptor, multi: true }];
