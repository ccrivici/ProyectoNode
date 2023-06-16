export interface Mantenimiento{
  [x: string]: string |boolean|string[];
  id:string;
  descripcion:string;
  estado:string;
  corregido:boolean;
  observaciones:string;
  imagenes: string[];
  periocidad: string;
  fecha?: any;
  item_id:string;
  ubicacion_id:string;
}
