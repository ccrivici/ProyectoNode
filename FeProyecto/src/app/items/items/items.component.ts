import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';
import { Item } from './item.model';
import { ItemsService } from './items.service';
import { Subscription } from 'rxjs';
import { PaginationItems } from './pagination-items.model';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { Ubicacion } from 'src/app/ubicaciones/ubicaciones/ubicacion.model';
import { CustomPaginator, Utils } from 'src/app/paginator';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator("Items por página") }
  ]
})
export class ItemsComponent implements OnInit, OnDestroy {
  desplegarColumnas = [
    'denominacion',
    'ubicacion',
    'conjuntoEquipo',
    'equipo',
    'marcaModelo',
    'periocidad',
    'categoria',
    'modificar',
    'eliminar',
  ];
  dataSource;
  idUbicacion!: any;
  ubicacion!: any;
  id!: string;
  baseUrl = environment.baseUrl;
  //variables para la paginacion
  totalItems = 0;
  itemsPorPagina = 5;
  paginaCombo = [1, 2, 5, 10];
  paginaActual = 1;
  sort = 'marcaModelo';
  sortDirection = 'asc';
  filterValue = {
    propiedad: 'denominacion',
    valor: '',
  };
  private itemsSubscription!: Subscription;

  timeout: any = null;
  util: any;
  constructor(
    public dialog: MatDialog,
    private itemsService: ItemsService,
    private ubicacionesService: UbicacionesService,
    private router: Router, private rutaActiva: ActivatedRoute
  ) { }

  eliminarRegistro(id: number) { }

  ngOnDestroy(): void { }
  ngOnInit(): void {
    this.util = new Utils();

    this.obtenerId();
    this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe(
      (response) => {
        this.ubicacion = response;
        this.util.mostrar2(`Vista de Items - ${response.nombre}`);
        this.filterValue = {
          propiedad: 'denominacion',
          valor: this.ubicacion.nombre,
        };

        this.itemsService.obtenerItemsPag(
          this.itemsPorPagina,
          this.paginaActual,
          this.sort,
          this.sortDirection,
          this.filterValue
        );
        this.itemsSubscription = this.itemsService
          .obtenerActualListenerPag()
          .subscribe((pagination: PaginationItems) => {
            var result = pagination.data.filter(item => item.denominacion == response.nombre)
            this.dataSource = new MatTableDataSource<Item>(result);
            this.totalItems = pagination.totalRows;
          });
      },
      (e) => {
        console.log('error: ' + e);
      }
    );
  }

  getItems(): Item[] {
    return this.dataSource.data;
  }

  eliminar(id: string) {
    console.log(this.baseUrl+`/item/${id}`)
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
        this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe((ubicacion: Ubicacion) => {
          // Aquí elimina el registro utilizando el ID
          this.itemsService.deleteItem(id).subscribe(() => {

          });
          this.ubicacionesService.deleteItemFromUbicacion(ubicacion, id,this.idUbicacion)

        })
      }
    });
  }
  obtenerId() {
    this.idUbicacion = this.rutaActiva.snapshot.params['ubicacionId']
  }
  //METODOS PARA PAGINACION

  hacerFiltro(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    //esta función se ejectua cuando el usuario deje de escribir por mas de un segundo
    this.timeout = setTimeout(() => {
      this.ubicacionesService.obtenerUbicacion(this.idUbicacion).subscribe((response: Ubicacion) => {

        if (event.keycode !== 13) {
          var filterValueLocal = {
            propiedad: 'marcaModelo',
            valor: event.target.value,
          };
        if (event.target.value === "") {
          filterValueLocal = {
            propiedad: 'denominacion',
            valor: response.nombre
          };
        }
          $this.filterValue = filterValueLocal;

          //aqui obtenemos los libros pasando como filtro la constante creada antes
          $this.itemsService.obtenerItemsPag(
            $this.itemsPorPagina,
            $this.paginaActual,
            $this.sort,
            $this.sortDirection,
            filterValueLocal
          );
        }
      });
    }, 1000);
  }
  eventoPaginador(event: PageEvent): void {
    this.itemsPorPagina = event.pageSize;
    this.paginaActual = event.pageIndex + 1;
    this.itemsService.obtenerItemsPag(
      this.itemsPorPagina,
      this.paginaActual,
      this.sort,
      this.sortDirection,
      this.filterValue
    );
  }

  ordenarColumna(event: any) {
    this.sort = event.active;
    this.sortDirection = event.direction;
    //obtenemos la lista de libros pero con el event.active capturamos la columna que tiene que ser ordenada y la direccion
    this.itemsService.obtenerItemsPag(
      this.itemsPorPagina,
      this.paginaActual,
      event.active,
      event.direction,
      this.filterValue
    );
  }
  goBack() {
    window.history.back();
  }
}
export { ItemsService };

