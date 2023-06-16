import { Component, OnInit } from '@angular/core';
import { UbicacionesService } from './ubicaciones/ubicaciones/ubicaciones.service';
import { Ubicacion } from './ubicaciones/ubicaciones/ubicacion.model';
import { Subscription } from 'rxjs';
import { SeguridadService } from './seguridad/seguridad.service';
import { NavigationEnd, Router } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './paginator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private ubicacionesSubscription!: Subscription;
  ubicacionesData: Ubicacion[] = [];
  ubicaciones: any;
  appComponent : AppComponent;
  constructor(private ubicacionesService: UbicacionesService,private seguridadService: SeguridadService,private router: Router) {
  }
  ngOnInit(): void {
    this.seguridadService.cargarUsuario();
    this.ubicacionesService.obtenerUbicacionesList();

    this.ubicacionesSubscription = this.ubicacionesService.obtenerActualListener().subscribe((ubicaciones: Ubicacion[]) => {
      this.ubicacionesData = ubicaciones;
    });
  }
   mostrar2(titulo:string, id?:string){
    const infoActualElement = document.querySelector('.info_actual');
    infoActualElement.textContent = titulo;
  }
}
