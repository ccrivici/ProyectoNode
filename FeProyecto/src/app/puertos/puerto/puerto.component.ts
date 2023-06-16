import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, Subscription, timeout } from 'rxjs';
import { Item } from 'src/app/items/items/item.model';
import { ItemsService } from 'src/app/items/items/items.service';
import { Ubicacion } from 'src/app/ubicaciones/ubicaciones/ubicacion.model';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';
import { PaginationUbicaciones } from './pagination-ubicaciones.model';
import { PuertoService } from './puerto.service';
import { PageEvent } from '@angular/material/paginator';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator, Utils } from 'src/app/paginator';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-puerto',
  templateUrl: './puerto.component.html',
  styleUrls: ['./puerto.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator("Puertos por página") }
  ]
})
export class PuertoComponent implements OnInit, OnDestroy {
  idUbicacion!: string;
  ubicacion!: any;
  dataSource = new MatTableDataSource<Item>();
  puertosData: Ubicacion[] = [];
  //variables para la paginacion
  totalPuertos = 0;
  puertosPorPagina = 5;
  paginaCombo = [1, 2, 5, 10];
  paginaActual = 1;
  sort = 'titulo';
  sortDirection = 'asc';
  filterValue = {
    propiedad: "tipo",
    valor: "puerto"
  }
  //variable para mostrar items o mantenimientos
  desplegarColumnasPuerto = ["nombre", "items", "añadir", "añadirMantenimiento", "mantenimientos", "generarPdf"];
  dataSourcePuertos = new MatTableDataSource<Ubicacion>();
  puertasos: Ubicacion[] = [];
  private ubicacionesSubscription!: Subscription;
  timeout: any = null;

  //variable para guardar ubicacion en la que guardar el pdf
  ubicacionDef: any
  mantenimientos: any[] = [];
  util: Utils;

  constructor(private itemsService: ItemsService, private ubicacionesService: UbicacionesService, private router: Router, private puertoService: PuertoService) { }

  ngOnInit(): void {
    this.util = new Utils();
    this.idUbicacion = this.obtenerId();
    this.util.mostrar2(`Vista de Puertos`);
    this.puertoService.obtenerPuertos(this.puertosPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);
    this.ubicacionesSubscription = this.puertoService.obtenerActualListenerPag().subscribe((pagination: PaginationUbicaciones) => {
      pagination.data.forEach(element => {
            element.id = element['_id'].toString()
        });
      var result = pagination.data.filter(edificio => edificio.tipo === "puerto")
      this.dataSourcePuertos = new MatTableDataSource<Ubicacion>(result);
      this.puertasos = pagination.data;
      this.totalPuertos = pagination.totalRows;
    });

  }
  ngOnDestroy() {

    this.ubicacionesSubscription.unsubscribe();
  }

  obtenerId() {
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    return urlParams.get('id') + "";
  }
  /*
  * Este método es usado para avanzar o retroceder en la paginación
  */
  eventoPaginador(event: PageEvent): void {
    this.puertosPorPagina = event.pageSize;
    this.paginaActual = event.pageIndex + 1;
    this.puertoService.obtenerPuertos(this.puertosPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);
  }

  ordenarColumna(event: any) {
    this.sort = event.active;
    this.sortDirection = event.direction;
    //obtenemos la lista de libros pero con el event.active capturamos la columna que tiene que ser ordenada y la direccion
    this.puertoService.obtenerPuertos(this.puertosPorPagina, this.paginaActual, event.active, event.direction, this.filterValue);
  }
  /*
  * métodos para filtrar los resultados de la paginación
  */
  hacerFiltro(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    //esta función se ejecuta cuando el usuario deje de escribir por mas de un segundo
    this.timeout = setTimeout(() => {
      if (event.keycode !== 13) {
        var filterValueLocal = {
          propiedad: 'nombre',
          valor: event.target.value
        };
        if ("edificio".includes(event.target.value)) {
          filterValueLocal = {
            propiedad: 'tipo',
            valor: "puerto"
          };
        }
        $this.filterValue = filterValueLocal;
        //obtenemos la lista de libros pero con el event.active capturamos la columna que tiene que ser ordenada y la direccion
        $this.puertoService.obtenerPuertos($this.puertosPorPagina, $this.paginaActual, $this.sort, $this.sortDirection, filterValueLocal);
      }
    }, 1000);
  }

  parse(date: Date) {
    var fecha = new Date(date)
    return fecha.toLocaleDateString("es-ES")
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
