import { Component, OnInit } from '@angular/core';
import { MantenimientoService } from './mantenimientos.service';
import { Subscription } from 'rxjs';
import { Mantenimiento } from './mantenimiento.model';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Ubicacion } from 'src/app/ubicaciones/ubicaciones/ubicacion.model';
import { DateAdapter } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { PaginationMantenimientos } from './pagination-mantenimientos';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CustomPaginator, Utils } from 'src/app/paginator';
import { ItemsComponent, ItemsService } from 'src/app/items/items/items.component';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Item } from 'src/app/items/items/item.model';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-mantenimientos',
  templateUrl: './mantenimientos.component.html',
  styleUrls: ['./mantenimientos.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator("Mantenimientos por página") }
  ]
})
export class MantenimientosComponent implements OnInit {
  private mantenimientoSubscription!: Subscription
  mantenimientoData: Mantenimiento[] = [];
  itemData: Item[] = [];
  desplegarColumnas = ["descripcion","estado","corregido","observaciones","periocidad","fecha","modificar","eliminar"];
  dataSource;

  //paginacion
  totalMantenimientos = 0;
  mantenimientosPorPagina = 4;
  paginaCombo = [1, 2, 5, 10];
  paginaActual = 1;
  sort = 'descripcion';
  sortDirection = 'asc';
  filterValue: any = null;
  id!: string;
  idUbicacion!: string;
  ubicacion!: Ubicacion;
  timeout: any = null;
  util: any;
  mantenimientos: any[] = [];
  items: any [] = [];
  constructor(private mantenimientoService: MantenimientoService,
    private ubicacionesService: UbicacionesService,
    private router: Router,
    private rutaActiva: ActivatedRoute,
    private readonly adapter: DateAdapter<Date>,
    public dialog: MatDialog, private itemsService: ItemsService) {}


  ngOnInit(): void {
    this.util = new Utils();

    this.obtenerId();

    /* this.itemsService.obtenerItems().subscribe((items) => {
      // Aquí puedes hacer lo que necesites con los datos de los items
      this.itemData = items;
    }); */

    /*
    * En esta llamada al método obtener ubicación editamos la cabecera del componente y establecemos el filtro para la páginación
    */
    this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe(response=>{
      this.util.mostrar2(`Vista de Mantenimientos - ${response.nombre}`);
    this.filterValue= {
      propiedad: "ubicacion_id",
      valor: this.idUbicacion
    }
    /*
    * En esta llamada al método mantenimientos Paginados obtenemos la lista de mantenimientos páginados y la asignamos al contenido d ela tabla
    */
    this.mantenimientoService.obtenerMantenimientosPag(this.mantenimientosPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);
    this.mantenimientoSubscription = this.mantenimientoService.obtenerActualListener().subscribe((pagination: PaginationMantenimientos) => {
      //esta línea filtra que los resultados de la paginación muestre solo los que pertenezcan a esa ubicación
      pagination.data.forEach(element => {
          element.id = element['_id'].toString()
        });
        //this.itemData = pagination.data
      var result = pagination.data.filter(mantenimiento => mantenimiento.ubicacion_id == response.id)
      this.dataSource = new MatTableDataSource<Mantenimiento>(pagination.data);
      this.totalMantenimientos = pagination.totalRows
    });


    /* this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe(response=>{
      this.ubicacion = response;
      if (this.ubicacion != undefined){
        this.dataSource = this.ubicacion.mantenimientos;
      }
    },e=>{
      console.log("error: "+e);
    }) */
  })
}

//Obtener Items y mostrar en la tabla
item: Item;
obtenerElemento(element: Mantenimiento): string {
  element.id = element['_id'].toString()
  /* console.log(`
  elemento id: ${element.id}
  elemento item id:${element.item_id}`) */
  this.item = this.itemData.find((item) => {
    console.log("asdadas "+item['_id'].toString())
    item['_id'].toString() == element.item_id;
    //console.log("e id "+element.item_id)
  })
  return this.item ? this.item.equipo : '';
}

  parse(date:Date){
    var fecha = new Date(date)
    return fecha.toLocaleDateString("es-ES")
  }
  eliminar(id:string){
    //eliminamos el elemento
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: '¿Está seguro de que desea eliminar este registro?',
        buttonText: {
          ok: 'Eliminar',
          cancel: 'Cancelar',
        },
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe((ubicacion:Ubicacion)=>{
          this.mantenimientoService.deleteMantenimiento(id).subscribe(data =>{
          });
          this.ubicacionesService.deleteMantenimientoFromUbicacion(ubicacion,id,this.idUbicacion);
        })
      }
    });
    //actualizamos la lista de items de la ubicacion
  }
  //obtiene el id  y el id de la ubicacion de la url
  obtenerId() {
    this.idUbicacion = this.rutaActiva.snapshot.params['ubicacionId'];
    this.id = this.rutaActiva.snapshot.params['id'];
  }

  //MÉTODOS PARA PAGINAR

  hacerFiltro(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    //esta función se ejectua cuando el usuario deje de escribir por mas de un segundo
    this.timeout = setTimeout(() => {
      this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe((response:Ubicacion) => {
      if (event.keycode !== 13) {
        var filterValueLocal = {
          propiedad: 'descripcion',
          valor: event.target.value
        };
        if (event.target.value === ""){
          filterValueLocal = {
            propiedad: 'ubicacion_id',
            valor: this.idUbicacion
          };
        }

        $this.filterValue = filterValueLocal;

        //aqui obtenemos los libros pasando como filtro la constante creada antes
        $this.mantenimientoService.obtenerMantenimientosPag($this.mantenimientosPorPagina, $this.paginaActual, $this.sort, $this.sortDirection, filterValueLocal);
      }
    });
    }, 1000);
  }
  eventoPaginador(event: PageEvent): void {
    this.mantenimientosPorPagina = event.pageSize;
    this.paginaActual = event.pageIndex + 1;
    this.mantenimientoService.obtenerMantenimientosPag(this.mantenimientosPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);
  }

  ordenarColumna(event: any) {
    this.sort = event.active;
    this.sortDirection = event.direction;
    //obtenemos la lista de libros pero con el event.active capturamos la columna que tiene que ser ordenada y la direccion
    this.mantenimientoService.obtenerMantenimientosPag(this.mantenimientosPorPagina, this.paginaActual, event.active, event.direction, this.filterValue);
  }
  goBack() {
    window.history.back();
  }
        // MÉTODOS PARA GENERAR EL PDF //
    construirTabla2(datos, columnas) {
      var body = [];
      body.push(columnas);

      datos.forEach(function (row) {
        var dataRow = [];
        columnas.forEach(function (column) {
          dataRow.push(row[column] + "");
        });
        body.push(dataRow)
      });
      return body;
    }
    tabla2(datos, columnas) {
      return {
        table: {
          headerRows: 1,
          body: this.construirTabla2(datos, columnas)
        }
      }
    }
    crearPdf(ubiId) {
      this.ubicacionesService.obtenerUbicacion(ubiId).subscribe((ubicacion: Ubicacion) => {
        var cont = 0;
        ubicacion.mantenimientos.forEach(element => {
          this.mantenimientos[cont] = {
            conjuntoEquipo: this.obtenerElemento(element), // Pasar element a obtenerElemento()
            descripcion: element.descripcion,
            periocidad: element.periocidad,
            estado: element.estado,
            corregido: element.corregido,
            observaciones: element.observaciones,
            fecha: this.parse(element.fecha),
          }
          cont++;
        })

        const pdfDefinition: any = {
          content: [
            {
              text: `Informes de mantenimiento del ${ubicacion.nombre}`,
              style: 'header'
            },
            this.tabla2(this.mantenimientos, ['conjuntoEquipo', 'descripcion', 'periocidad', 'estado', 'corregido', 'observaciones', 'fecha']) // Usar 'conjuntoEquipo' en lugar de 'elemento'
          ]
        }
        const pdf = pdfMake.createPdf(pdfDefinition);
        this.mantenimientos = [];
        pdf.open();
      });
    }

    /*
    * Este método es usado para aplicar un color al atributo estado de los mantenimientos según el valor que tenga
    */
    getEstadoStyles(estado: string) {
      let styles = {};

      switch (estado) {
        case 'Favorable':
          styles = { color: 'rgb(0, 214, 0)' };
          break;
        case 'Defecto Leve':
          styles = { color: 'rgb(173, 173, 7)' };
          break;
        case 'Defecto Grave':
          styles = { color: 'rgb(255, 165, 0)' };
          break;
        case 'Defecto Crítico':
          styles = { color: 'rgb(255, 23, 23)' };
          break;
        default:
          break;
      }
      return styles;
    }
}
