import { Mantenimiento } from "./mantenimiento.model";

export interface PaginationMantenimientos {
  pageSize: number;
  page: number;
  sort: string;
  sortDirection: string;
  pagesQuantity: number;
  data: Mantenimiento[];
  filterValue: {};
  totalRows: number;
}
