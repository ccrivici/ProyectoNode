import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment.development";
import { Mantenimiento } from "./mantenimiento.model";
import { PaginationMantenimientos } from "./pagination-mantenimientos";

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  baseUrl = environment.baseUrl;

  mantenimientoPaginationSubject = new Subject<PaginationMantenimientos>();
  mantenimientoPagination!: PaginationMantenimientos;

  constructor(private http: HttpClient) { }


  obtenerMantenimientosPag(mantenimientoPorPagina: number, paginaActual: number, sort: string, sortDirection: string, filterValue: any) {
    const request = {
      PageSize: mantenimientoPorPagina,
      page: paginaActual,
      sort,
      sortDirection,
      filterValue
    }
    this.http.post<PaginationMantenimientos>(this.baseUrl + '/mantenimiento/Pagination', request).subscribe((data) => {
      this.mantenimientoPagination = data;
      this.mantenimientoPaginationSubject.next(this.mantenimientoPagination);
    });
  }
  guardarMantenimiento(mantenimiento: Mantenimiento) {
    return this.http.post(this.baseUrl + '/mantenimiento', mantenimiento);
  }
  obtenerMantenimientoById(id: string) {
    return this.http.get<Mantenimiento>(this.baseUrl + `/mantenimiento/${id}`);
  }
  obtenerActualListener() {
    return this.mantenimientoPaginationSubject.asObservable();
  }
  updateMantenimiento(id: string, mantenimiento: Mantenimiento): Observable<any> {
    return this.http.put(this.baseUrl + `/mantenimiento/${id}`, mantenimiento);
  }
  deleteMantenimiento(id: string): Observable<any> {
    return this.http.delete(this.baseUrl + `/mantenimiento/${id}`);
  }
}
