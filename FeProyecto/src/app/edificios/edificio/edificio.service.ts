import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { PaginationUbicaciones } from "src/app/ubicaciones/ubicaciones/pagination-ubicaciones.model";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn:'root'
})
export class EdificioService{
  baseUrl = environment.baseUrl;
  edificiosPagination!: PaginationUbicaciones;
  edificioSubjectPagination = new Subject<PaginationUbicaciones>();
  constructor(private http: HttpClient) {}

  obtenerEdificios(edificiosPorPagina: number, paginaActual: number, sort: string, sortDirection: string, filterValue: any) {
    const request = {
      PageSize: edificiosPorPagina,
      page: paginaActual,
      sort,
      sortDirection,
      filterValue
    }
    this.http.post<PaginationUbicaciones>(this.baseUrl + '/ubicacion/pagination', request).subscribe((data) => {
       this.edificiosPagination = data;
      this.edificioSubjectPagination.next(this.edificiosPagination);
    });
  }

  obtenerActualListenerPag() {
    return this.edificioSubjectPagination.asObservable();
  }
}
