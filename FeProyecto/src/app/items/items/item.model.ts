
export interface Item{
  [x: string]: string |String;
  id:string;
  denominacion:string;
  ubicacion:string;
  conjuntoEquipo:string;
  equipo:string;
  marcaModelo:String;
  periocidad:string;
  categoria:string;
}
//db.Items.insertOne({id:'',denominacion:'',ubicacion:{nombre:''},conjuntoEquipo:'',equipo:'',marcaModelo:'',periocidad:'',categoria:''}false,true)
//db.Items.update({id:'',denominacion:'',ubicacion:{id:'',nombre:'',tipo:'',items:{},,conjuntoEquipo:'',equipo:'',marcaModelo:'',periocidad:'',categoria:''}false,true)
