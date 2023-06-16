import { Component, OnInit } from '@angular/core';
import { UbicacionesService } from './ubicaciones.service';
import { Ubicacion } from './ubicacion.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.component.html',
  styleUrls: ['./ubicaciones.component.css']
})
export class UbicacionesComponent implements OnInit {
  totalUbicaciones = 0;
  ubicacionesPorPagina = 2;
  paginaCombo = [1, 2, 5, 10];
  paginaActual = 1;
  sort = 'nombre';
  sortDirection = 'asc';
  filterValue:any = null;
  id! :String;
  dataSource = new MatTableDataSource<Ubicacion>();
  private ubicacionesSubscription!: Subscription;
  desplegarColumnas = ["nombre", "items", "mantenimientos","ubicacion"];
  ubicacionesData : Ubicacion[] = [];

  constructor(private ubicacionesService:UbicacionesService,private rutaActiva: ActivatedRoute){}

  ngOnInit(): void {
    this.ubicacionesService.obtenerUbicacionesPag(this.ubicacionesPorPagina, this.paginaActual, this.sort, this.sortDirection, this.filterValue);

    this.ubicacionesSubscription = this.ubicacionesService.obtenerActualListener().subscribe((ubicaciones: Ubicacion[]) => {
      this.dataSource = new MatTableDataSource<Ubicacion>(ubicaciones);
    });

  }
}
