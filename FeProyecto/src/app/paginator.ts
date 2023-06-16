import { OnInit } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { count } from "rxjs";
/*
* Esta clase es usada para guardar métodos distintos que serán usados en la aplicación
*
*/
export class Utils {
  constructor() { }
  /*
  * Este método se encarga de modificar la cabecera que aparece en cada vista
  */
  mostrar2(titulo: string) {
    const infoActualElement = document.querySelector('.info_actual');
    infoActualElement.textContent = titulo;
  }
}
/*
* Esta función se encarga de modificar el paginador
*/
export function CustomPaginator(texto: string) {
  const customPaginatorIntl = new MatPaginatorIntl();
  customPaginatorIntl.itemsPerPageLabel = texto;
  customPaginatorIntl.previousPageLabel = "Página anterior";
  customPaginatorIntl.nextPageLabel = "Página siguiente";
  customPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    const start = (page * pageSize) + 1;
    const end = Math.min((page + 1) * pageSize, length);
    const total = length;
    return `${start} - ${end} de ${total}`;
  };
  return customPaginatorIntl;
}
