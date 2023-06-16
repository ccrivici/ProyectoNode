import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { Item } from "./item.model";
import { Observable, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { PaginationItems } from "./pagination-items.model";

@Injectable({
  providedIn:'root'
})
export class ItemsService{
  baseUrl = environment.baseUrl;

  private itemsLista: Item[] = [];
  private itemsSubject = new Subject<Item[]>();
  itemById!:Item;
  private itemsPagination!: PaginationItems;
  private itemsSubjectPagination=new Subject<PaginationItems>();
  constructor(private http: HttpClient) {}

  obtenerItemsPag(totalItems:number, paginaActual:number, sort:string,sortDirection:string,filterValue:any){
    const request = {
      PageSize:totalItems,
      page:paginaActual,
      sort,
      sortDirection,
      filterValue
    }
    this.http.post<PaginationItems>(this.baseUrl + '/item/pagination',request).subscribe((data) => {
      this.itemsPagination = data;
      this.itemsSubjectPagination.next(this.itemsPagination);
    });
  }
  obtenerActualListenerPag() {
    return this.itemsSubjectPagination.asObservable();
  }

  obtenerItems(): Observable<Item[]> {
    this.http.get<Item[]>(this.baseUrl + '/item').subscribe((data) => {
      this.itemsLista = data;
      this.itemsSubject.next([...this.itemsLista]);
    });
    return this.http.get<Item[]>(this.baseUrl + '/item');
  }
  obtenerItemById(id:string){
    return this.http.get<Item>(this.baseUrl + `/item/${id}`);
  }
  obtenerActualListener() {
    return this.itemsSubject.asObservable();
  }
  updateItem(id:string,item: Item):Observable<any>{
    return this.http.put(this.baseUrl+`/item/${id}`,item);
  }
  guardarItem(item:Item){
    return this.http.post(this.baseUrl+'/item',item);
  }
  deleteItem(id: string):Observable<any>{
    return this.http.delete(this.baseUrl+`/item/${id}`);
  }
}
