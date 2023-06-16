import { Ubicacion } from "./ubicacion.model";


export interface PaginationUbicaciones{
  pageSize?: number;
  page?:number;
  sort?:string;
  sortDirection?:string;
  pagesQuantity?:number;
  data?: Ubicacion[];
  filterValue?:{
    propiedad?:string,
    valor?:string
  };
  totalRows?:number;
}
