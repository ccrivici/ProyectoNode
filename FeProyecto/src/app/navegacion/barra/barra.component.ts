import { Router, NavigationEnd } from '@angular/router';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';

@Component({
  selector: 'app-barra',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.css']
})
export class BarraComponent implements OnInit {
  ubicaciones: any;
  constructor(
    private router: Router,
    private ubicacionesService: UbicacionesService
  ) {}

  @Output() menuToggle = new EventEmitter<void>();

  onMenuToggleDispatch() {
    this.menuToggle.emit();
  }

  ngOnInit() {
    /* this.ubicacionesService.obtenerUbicacionesList().subscribe(ubicaciones => {
      this.ubicaciones = ubicaciones;
    }); */

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
         const rutaActiva = this.router.url;
        const rutaSinBarraInicial = rutaActiva.substring(1); // Elimina la barra inicial de la ruta
        const rutaSeparadaPorBarras = rutaSinBarraInicial.split('/'); // Separa la ruta por cada barra
        let nombreRuta = '';

        if (rutaSeparadaPorBarras.length > 1) {
          const idUbicacion = rutaSeparadaPorBarras[rutaSeparadaPorBarras.length - 1]; // Obtiene el último segmento de la ruta
          if (this.ubicaciones) {
            const ubicacion = this.ubicaciones.find(u => u.id === idUbicacion);
            if (ubicacion) {
              nombreRuta = ubicacion.nombre;
            }
          }
          const primeraParteRuta = rutaSeparadaPorBarras[0];
          nombreRuta = `${primeraParteRuta.charAt(0).toUpperCase()}${primeraParteRuta.slice(1)} - ${nombreRuta}`;
        } else {
          nombreRuta = rutaSeparadaPorBarras[0];
        }

        document.querySelector('.info_actual').textContent = nombreRuta.charAt(0).toUpperCase() + nombreRuta.slice(1);
      }
    });
  }

}
