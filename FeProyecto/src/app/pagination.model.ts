import { Item } from "./items/items/item.model";
import { Mantenimiento } from "./mantenimientos/mantenimientos/mantenimiento.model";
import { Ubicacion } from "./ubicaciones/ubicaciones/ubicacion.model";

export interface Pagination{
  pageSize: number;
  page:number;
  sort:string;
  sortDirection:string;
  pagesQuantity:number;
  data: Ubicacion[] | Item[] | Mantenimiento[];
  filterValue:{};
  totalRows:number;
}
