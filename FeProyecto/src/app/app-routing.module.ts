import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemsComponent } from './items/items/items.component';
import { RegistrarItemComponent } from './items/registrar-item/registrar-item.component';
import { PuertoComponent } from './puertos/puerto/puerto.component';
import { EdificioComponent } from './edificios/edificio/edificio.component';
import { UbicacionesComponent } from './ubicaciones/ubicaciones/ubicaciones.component';
import { GenerarUbicacionComponent } from './ubicaciones/generar-ubicacion/generar-ubicacion.component';
import { RegistrarComponent } from './seguridad/registrar/registrar.component';
import { LoginComponent } from './seguridad/login/login.component';
import { MantenimientosComponent } from './mantenimientos/mantenimientos/mantenimientos.component';
import { RegistrarMantenimientoComponent } from './mantenimientos/registrar-mantenimiento/registrar-mantenimiento.component';
import { SeguridadRouter } from './seguridad/seguridad.router';
import { InicioComponent } from './inicio/inicio/inicio.component';

const routes: Routes = [
  { path: 'items', component: ItemsComponent, canActivate: [SeguridadRouter] },
  { path: 'items/:ubicacionId', component: ItemsComponent, canActivate: [SeguridadRouter] },
  { path: 'registrar', component: RegistrarItemComponent, canActivate: [SeguridadRouter] },
  { path: 'registrar/:ubicacionId', component: RegistrarItemComponent, canActivate: [SeguridadRouter]},
  { path: 'registrar/:id/:ubicacionId', component: RegistrarItemComponent, canActivate: [SeguridadRouter]},
  { path: 'ubicaciones', component: UbicacionesComponent , canActivate: [SeguridadRouter]},
  { path: 'edificios', component: EdificioComponent, canActivate: [SeguridadRouter]},
  { path: 'puertos', component: PuertoComponent, canActivate: [SeguridadRouter]},
  { path: 'añadirUbicacion', component: GenerarUbicacionComponent },
  { path: 'login', component: LoginComponent},
  { path: 'registrarse', component: RegistrarComponent},
  { path: 'mantenimientos', component: MantenimientosComponent, canActivate: [SeguridadRouter]},
  { path: 'mantenimientos/:ubicacionId', component: MantenimientosComponent, canActivate: [SeguridadRouter]},
  { path: 'registrarMantenimiento', component: RegistrarMantenimientoComponent, canActivate: [SeguridadRouter]},
  { path: 'registrarMantenimiento/:ubicacionId', component: RegistrarMantenimientoComponent, canActivate: [SeguridadRouter]},
  { path: 'registrarMantenimiento/:id/:ubicacionId', component: RegistrarMantenimientoComponent, canActivate: [SeguridadRouter]},
  { path: 'inicio', component: InicioComponent },
  { path: '', redirectTo: 'inicio', pathMatch: 'full' }, // Redirige al InicioComponent al inicio
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers:[SeguridadRouter]
})
export class AppRoutingModule { }
