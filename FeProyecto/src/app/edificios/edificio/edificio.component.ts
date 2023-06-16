import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Item } from 'src/app/items/items/item.model';
import { ItemsService } from 'src/app/items/items/items.service';
import { Ubicacion } from 'src/app/ubicaciones/ubicaciones/ubicacion.model';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';
import { EdificioService } from './edificio.service';
import { Subscription } from 'rxjs';
import { PaginationUbicaciones } from 'src/app/ubicaciones/ubicaciones/pagination-ubicaciones.model';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CustomPaginator, Utils } from 'src/app/paginator';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-edificio',
  templateUrl: './edificio.component.html',
  styleUrls: ['./edificio.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator("Edificios por página") }
  ]
})
export class EdificioComponent implements AfterViewInit {

  idUbicacion!: string;
  ubicacion!: any;
  desplegarColumnasEdificio = ["nombre", "items","añadir", "añadirMantenimiento","mantenimientos","generarPdf"];
  @ViewChild(MatPaginator) paginacion!: MatPaginator;
  @ViewChild(MatSort) ordenamiento!: MatSort;

  dataSource = new MatTableDataSource<Item>();
  private ubicacionesSubscription!: Subscription;
  dataSourceEdificios = new MatTableDataSource<Ubicacion>();
  edificiosData: Ubicacion[] = [];
  //variables para la paginacion
  totalEdificios = 0;
  edificiosPorPagina = 5;
  paginaCombo = [1, 2, 5, 10];
  paginaActual = 1;
  sort = 'titulo';
  sortDirection = 'asc';
  filterValue = {
    propiedad: "tipo",
    valor: "edificio"
  }
  timeout: any = null;
  util: Utils;
  //variable para guardar ubicacion en la que guardar el pdf
  ubicacionDef: any
  mantenimientos: any[] = [];

  constructor(private itemsService: ItemsService, private ubicacionesService: UbicacionesService, private router: Router, private edificioService: EdificioService) { }

  ngOnInit(): void {
    this.util = new Utils();
    this.util.mostrar2("Vista de Edificios");
    this.idUbicacion = this.obtenerId();
    this.edificioService.obtenerEdificios(this.edificiosPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);
      //cargamos la lista de ubicaciones de tipo Edificio paginado
    this.ubicacionesSubscription = this.edificioService.obtenerActualListenerPag().subscribe((pagination: PaginationUbicaciones) => {
      pagination.data.forEach(element => {
        element.id = element['_id'].toString()
    });

      var result= pagination.data.filter(edificio => edificio.tipo === "edificio")
      this.dataSourceEdificios = new MatTableDataSource<Ubicacion>(pagination.data);
      this.totalEdificios = pagination.totalRows
    });
  }

  ngOnDestroy() {
    this.ubicacionesSubscription.unsubscribe();
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.ordenamiento;
    this.dataSourceEdificios.paginator = this.paginacion;
  }

  obtenerId() {
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    this.idUbicacion = urlParams.get('id') + "";
    return urlParams.get('id') + "";
  }
  /*
  * métodos para filtrar los resultados de la paginación
  */
  hacerFiltro(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    //esta función se ejectua cuando el usuario deje de escribir por mas de un segundo
    this.timeout = setTimeout(() => {
      if (event.keycode !== 13) {
        var filterValueLocal = {
          propiedad: 'nombre',
          valor: event.target.value
        };
        if ("puerto".includes(event.target.value)) {
          filterValueLocal = {
            propiedad: 'tipo',
            valor: "edificio"
          };
        }
        $this.filterValue = filterValueLocal;

        //aqui obtenemos los libros pasando como filtro la constante creada antes
        $this.edificioService.obtenerEdificios($this.edificiosPorPagina, $this.paginaActual, $this.sort, $this.sortDirection, filterValueLocal);
      }
    }, 1000);
  }
  /*
  * Este método es usado para avanzar o retroceder en la paginación
  */
  eventoPaginador(event: PageEvent): void {
    this.edificiosPorPagina = event.pageSize;
    this.paginaActual = event.pageIndex + 1;
    this.edificioService.obtenerEdificios(this.edificiosPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);
  }

  ordenarColumna(event: any) {
    this.sort = event.active;
    this.sortDirection = event.direction;
    //obtenemos la lista de libros pero con el event.active capturamos la columna que tiene que ser ordenada y la direccion
    this.edificioService.obtenerEdificios(this.edificiosPorPagina, this.paginaActual, event.active, event.direction, this.filterValue);
  }
  /*
  *métodos para generar el pdf
  */
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
  parse(date: Date) {
    var fecha = new Date(date)
    return fecha.toLocaleDateString("es-ES")
  }
  crearPdf(ubiId) {
    //obtener mantenimientos de la ubicacion
    this.ubicacionesService.obtenerUbicacion(ubiId).subscribe((ubicacion: Ubicacion) => {

      var cont = 0;
      //Guardamos los Mantenimientos de la Ubicación en una lista para mostrarlos en el Pdf
      ubicacion.mantenimientos.forEach(element => {
        this.mantenimientos[cont] = {
          descripcion: element.descripcion,
          periocidad: element.periocidad,
          estado: element.estado,
          corregido: element.corregido,
          observaciones: element.observaciones,
          fecha: this.parse(element.fecha),
        }
        cont++;
      })
        //Definimos la cabecera del Pdf
      const pdfDefinition: any = {
        content: [
          {
            text: `Informes de mantenimiento del ${ubicacion.nombre}
              `, style: 'header'
          },
          this.tabla2(this.mantenimientos, ['descripcion', 'periocidad', 'estado', 'corregido', 'observaciones', 'fecha'])
        ]
      }
      const pdf = pdfMake.createPdf(pdfDefinition);
      this.mantenimientos = [];
      pdf.open();
    });
  }
}
