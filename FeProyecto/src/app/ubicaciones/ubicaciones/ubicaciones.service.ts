import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Ubicacion } from "./ubicacion.model";
import { environment } from "src/environments/environment.development";
import { Subject } from "rxjs";
import { PaginationUbicaciones } from "./pagination-ubicaciones.model";
import { Item } from "src/app/items/items/item.model";
import { Mantenimiento } from "src/app/mantenimientos/mantenimientos/mantenimiento.model";
import { MantenimientoService } from "src/app/mantenimientos/mantenimientos/mantenimientos.service";
import { Router } from "@angular/router";


@Injectable({
  providedIn:'root'
})
export class UbicacionesService{
  private ubicacionesList: Ubicacion[] = [];
  baseUrl = environment.baseUrl;
  ubicacionSubjectPagination= new Subject<PaginationUbicaciones[]>();
  ubicacionSubject = new Subject<Ubicacion[]>();
  private ubicacionesPagination!: PaginationUbicaciones[];

  constructor(private http:HttpClient,private mantenimientoService: MantenimientoService,private router :Router){}
  ubicacionSubjectDef = new Subject<Ubicacion>();
 ubicacionFiltrada!:Ubicacion;

 /*
 * Este método se encarga de traer del Backend la lista de Ubicaciones paginadas
 */
  obtenerUbicacionesPag(totalUbicaciones:number, paginaActual:number, sort:string,sortDirection:string,filterValue:any){
    const request = {
      PageSize:totalUbicaciones,
      page:paginaActual,
      sort,
      sortDirection,
      filterValue
    }
    this.http.post<PaginationUbicaciones[]>(this.baseUrl + '/ubicacion/pagination',request).subscribe((data) => {
      this.ubicacionesPagination = data;
      this.ubicacionSubjectPagination.next(this.ubicacionesPagination);
    });
  }

  obtenerActualListenerPag(){
    return this.ubicacionSubjectPagination.asObservable();
  }
  obtenerUbicacion(id:string){
   return this.http.get<Ubicacion>(this.baseUrl + `/ubicacion/${id}`);

  }
  obtenerActualListenerDef(){
    return this.ubicacionSubjectDef;
  }
  /*
  * Este método se encarga de actualizar la Ubicación
  */
  updateUbicacion(id:String, ubicacion:Ubicacion,item:Item,idItem:string){
    var modificado = false;

    ubicacion.items.forEach(element => {
      if (element["_id"] == idItem){
        console.log(`id item: ${element.id} buscando: ${idItem}`)
        element.id = idItem;
        element.denominacion = item.denominacion;
        element.ubicacion = item.ubicacion;
        element.conjuntoEquipo = item.conjuntoEquipo;
        element.equipo = item.equipo;
        element.marcaModelo= item.marcaModelo;
        element.periocidad = item.periocidad;
        element.categoria = item.categoria;
        modificado = true;
      }
    });
    if (modificado == false){
      ubicacion.items.push(item)
    }
    this.http.put<Ubicacion>(this.baseUrl + `/ubicacion/${id}`,ubicacion).subscribe((data) => {
        console.log(data)
    });
  }
  updateMantenimiento(id:String, ubicacion:Ubicacion,mantenimiento:Mantenimiento,idMantenimiento:string){
    var modificado = false;

    ubicacion.mantenimientos.forEach(element => {
      if (element["_id"] == idMantenimiento){
        element.id = idMantenimiento;
        element.descripcion = mantenimiento.descripcion;
        element.estado = mantenimiento.estado;
        element.corregido = mantenimiento.corregido;
        element.observaciones = mantenimiento.observaciones;
        element.imagenes= mantenimiento.imagenes;
        element.periocidad = mantenimiento.periocidad;
        element.fecha = mantenimiento.fecha;
        element.item_id = mantenimiento.item_id;
        element.ubicacion_id = mantenimiento.ubicacion_id;
        modificado = true;
      }
    });
    if (modificado == false){
      ubicacion.mantenimientos.push(mantenimiento)
    }
    this.http.put<Ubicacion>(this.baseUrl + `/ubicacion/${id}`,ubicacion).subscribe((data) => {
        console.log(data)
    });
  }
  deleteItemFromUbicacion(ubicacion:Ubicacion,itemId:string,ubiId:string){
    var contador = 0;
    //eliminamos el item de la lista de items
    ubicacion.items.forEach(element =>{
      if (element["_id"].toString() == itemId){
        ubicacion.items.splice(contador,1);
      }
      contador++;
    })

    var mantenimientos = new Array();
    ubicacion.mantenimientos.forEach(element =>{
        if (element.item_id != itemId){
          mantenimientos.push(element);
        }else{//entra cuando el mant pertenece al item
          this.mantenimientoService.deleteMantenimiento(element['_id'].toString()).subscribe(()=>{})
          setTimeout(()=>{},600)
        }
    })
    ubicacion.mantenimientos = mantenimientos;
    this.http.put<Ubicacion>(this.baseUrl + `/ubicacion/${ubicacion["_id"]}`,ubicacion).subscribe((data) => {});
    setTimeout(()=>{
      window.location.reload()
    },600)
  }

  deleteMantenimientoFromUbicacion(ubicacion:Ubicacion,mantenimientoId:string,ubiId:string){
    var contador = 0;
    ubicacion.mantenimientos.forEach(element =>{
      if (element["_id"].toString() == mantenimientoId){
        ubicacion.mantenimientos.splice(contador,1);
      }
      contador++;
    })

    this.http.put<Ubicacion>(this.baseUrl + `/ubicacion/${ubicacion["_id"]}`,ubicacion).subscribe((data) => {
      setTimeout(()=>{
        window.location.reload();
      },1000)
  });
  }

  obtenerUbicacionesList(){
    return this.http.get<Ubicacion[]>(this.baseUrl + '/ubicacion');
  }

  obtenerActualListener(){
    return this.ubicacionSubject.asObservable();
  }
}
