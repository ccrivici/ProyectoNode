import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PaginationUbicaciones } from "src/app/ubicaciones/ubicaciones/pagination-ubicaciones.model";
import { Ubicacion } from "src/app/ubicaciones/ubicaciones/ubicacion.model";
import { environment } from "src/environments/environment.development";


@Injectable({
  providedIn: 'root'
})
export class PuertoService {
  baseUrl = environment.baseUrl;
  puertoSubjectPagination = new Subject<PaginationUbicaciones>();
  puertoSubject = new Subject<Ubicacion[]>();
  puertosPagination!: PaginationUbicaciones;

  constructor(private http: HttpClient) { }

  obtenerPuertos(puertosPorPagina: number, paginaActual: number, sort: string, sortDirection: string, filterValue: any) {
    const request = {
      PageSize: puertosPorPagina,
      page: paginaActual,
      sort,
      sortDirection,
      filterValue
    }
    this.http.post<PaginationUbicaciones>(this.baseUrl + '/ubicacion/pagination', request).subscribe((data) => {
      this.puertosPagination = data;
      this.puertoSubjectPagination.next(this.puertosPagination);
    });
  }

  obtenerActualListenerPag() {
    return this.puertoSubjectPagination.asObservable();
  }

}
