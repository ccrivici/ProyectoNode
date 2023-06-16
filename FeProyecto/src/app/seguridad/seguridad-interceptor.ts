import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SeguridadService } from "./seguridad.service";
@Injectable()
export class SeguridadInterceptor implements HttpInterceptor {

  constructor(private seguridadService: SeguridadService) { }

  //tiene 2 param el primero captura el request y el segundo de tipo next se encarga de enviar el request al backend
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const tokenSeguridad = this.seguridadService.obtenerToken();

    if (tokenSeguridad != undefined) {
      const request = req.clone({

        setHeaders: {
          'x-acces-token': tokenSeguridad
        }
      });
      return next.handle(request);
    } else {
      const request = req.clone({
        setHeaders: {
          'x-acces-token': ""
        }
      })
      return next.handle(request);
    }
  }
}
