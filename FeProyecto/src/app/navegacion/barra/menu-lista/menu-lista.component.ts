import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SeguridadService } from 'src/app/seguridad/seguridad.service';

@Component({
  selector: 'app-menu-lista',
  templateUrl: './menu-lista.component.html',
  styleUrls: ['./menu-lista.component.css']
})
export class MenuListaComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  estadoUsuario!: boolean;
  usuarioSubscription!: Subscription;

  constructor(private seguridadService: SeguridadService) {

  }
  ngOnDestroy(): void {
    this.usuarioSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.usuarioSubscription = this.seguridadService.seguridadCambio.subscribe( status =>{
      this.estadoUsuario = status;
    })
  }

  onCerrarMenu(){
    this.menuToggle.emit();
  }

  terminarSesionMenu(){
    this.onCerrarMenu();
    this.seguridadService.salirSesion();
  }
}
