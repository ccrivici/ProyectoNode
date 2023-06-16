import { Component, OnDestroy, OnInit } from '@angular/core';
import { ItemsService } from '../items/items.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';
import { Ubicacion } from 'src/app/ubicaciones/ubicaciones/ubicacion.model';
import { Subscription } from 'rxjs';
import { Item } from '../items/item.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from 'src/app/paginator';

@Component({
  selector: 'app-registrar-item',
  templateUrl: './registrar-item.component.html',
  styleUrls: ['./registrar-item.component.css']
})
export class RegistrarItemComponent implements OnInit, OnDestroy {
  //atributos para recoger datos del select del formulario
  selectconjuntoEquipo!: string;
  selectEquipo!: string;
  selectDenominacion!: Ubicacion;
  selectPeriocidad!: string;
  selectCategoria!: string;

  ubicaciones: Ubicacion[] = [];
  //borrar?
  //end borrar
  ubicacion!: Ubicacion
  ubicacionSubscription!: Subscription;
  //atributos para paginar
  totalUbicaciones = 0;
  ubicacionesPorPagina = 2;
  paginaCombo = [1, 2, 5, 10];
  paginaActual = 1;
  sort = 'nombre';
  sortDirection = 'asc';
  filterValue: any = null;
  //atributos añadir/editar
  item: Item | undefined;
  id!: string;
  ubicacionId!: string;
  ubicacionNombre!: string;
  accion = "Añadir";
  itemForm: FormGroup;
  itemGuardado!: Item | any;
  editarItem = false;
  itemDef!: Item;
  util: any;

  //Card alerta
   mostrarCarta: boolean = false;
   mensajeItemAnadido: string = "";

  constructor(private itemService: ItemsService, private ubicacionesService: UbicacionesService, private fb: FormBuilder,private router :Router,private rutaActiva: ActivatedRoute) {
    this.itemForm = this.fb.group({
      denominacion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      conjuntoEquipo: ['', Validators.required],
      equipo: ['', Validators.required],
      marcaModelo: ['', Validators.required],
      periocidad: ['', Validators.required],
      categoria: ['', Validators.required],
    })
  }
  /*
  * Este método es llamado cuando el usuario hace click en el botón de añadir/editar ítems del formulario
  */
  registrarEditarItems() {
    if (this.itemGuardado == undefined) {
      console.log("AÑADIENDO ITEM")
      const item: Item = {
        id: "",
        denominacion: this.itemForm.get('denominacion')?.value,
        ubicacion: this.itemForm.get('ubicacion')?.value,
        conjuntoEquipo: this.itemForm.get('conjuntoEquipo')?.value,
        equipo: this.itemForm.get('equipo')?.value,
        marcaModelo: this.itemForm.get('marcaModelo')?.value,
        periocidad: this.itemForm.get('periocidad')?.value,
        categoria: this.itemForm.get('categoria')?.value,
      }
      //AÑADIR ITEM
      this.itemService.guardarItem(item).subscribe((dato: any) => {
        this.itemDef = dato;
        item.id = dato._id;

        this.ubicacionesService.obtenerUbicacion(this.ubicacionId).subscribe((ubicacion: Ubicacion) => {
          this.ubicacion = ubicacion;
          //añadimos el Ítem a la  lista de ítems de la Ubicación
          this.ubicacionesService.updateUbicacion(this.ubicacionId, ubicacion, this.itemDef, item.id)
        });
      });
      this.mostrarAlerta('Ítem Añadido');
    } else if(this.editarItem) {
      //lógica para modificar el ítem
      const item: Item = {
        id: this.id,
        denominacion: this.itemForm.get('denominacion')?.value,
        ubicacion: this.itemForm.get('ubicacion')?.value,
        conjuntoEquipo: this.itemForm.get('conjuntoEquipo')?.value,
        equipo: this.itemForm.get('equipo')?.value,
        marcaModelo: this.itemForm.get('marcaModelo')?.value,
        periocidad: this.itemForm.get('periocidad')?.value,
        categoria: this.itemForm.get('categoria')?.value
      }
      console.log(`id a mod: ${item.id}`)
      this.itemService.updateItem(this.id, item).subscribe(() => {});

      this.ubicacionesService.obtenerUbicacion(this.ubicacionId).subscribe((ubicacion: Ubicacion) => {
          this.ubicacion = ubicacion;
          this.ubicacionesService.updateUbicacion(this.ubicacionId, ubicacion, item,item.id)
        });
        this.mostrarAlerta('Ítem Editado');
      }
      setTimeout(() => {
        this.router.navigate(['/items', this.ubicacionId]);
      }, 2000)
  }
  obtenerUbicacion(id: string) {
    this.ubicacionesService.obtenerUbicacion(id).subscribe((ubicacion: Ubicacion) => {
      this.ubicacion = ubicacion;
    });
  }
  ngOnInit(): void {
    //Inicializa una instancia de la clase Utils para modificar la cabecera de la página
    this.util = new Utils();
    //Obtenemos los id de la ruta
    this.obtenerId();
    /*
    * lógica para controlar si estamos añadiendo un mantenimiento o modificándolo
    */
    if (this.id != undefined && this.ubicacionId != undefined) {

      this.esEditar();
    } else if (this.ubicacionId != undefined && this.id == undefined) {
      this.ubicacionesService.obtenerUbicacion(this.ubicacionId).subscribe(ubicacion => {
        this.util.mostrar2(`Añadir Ítem - ${ubicacion.nombre}`);
        this.ubicaciones[0] = ubicacion;
        this.itemForm.patchValue({
          denominacion: ubicacion.nombre,
        })
      });
    }
    else {
      this.ubicacionesService.obtenerUbicacionesList().subscribe((datos: Ubicacion[]) => {
        this.ubicaciones = datos;
      })
    }
  }

  esEditar() {
    if (this.id !== "null"){
      this.accion = "Editar";
      console.log(`id: ${this.id}`)
      this.itemService.obtenerItemById(this.id).subscribe((dato: Item) => {
        this.itemGuardado = dato;
        this.ubicacionesService.obtenerUbicacion(this.ubicacionId).subscribe(ubicacion => {
          this.util.mostrar2(`Editar Ítem - ${ubicacion.nombre}`);
          this.ubicaciones[0] = ubicacion;
          this.itemForm.patchValue({
            denominacion: ubicacion.nombre,
            ubicacion: this.itemGuardado.ubicacion,
            conjuntoEquipo: this.itemGuardado.conjuntoEquipo,
            equipo: this.itemGuardado.equipo,
            periocidad: this.itemGuardado.periocidad,
            categoria: this.itemGuardado.categoria,
            marcaModelo: this.itemGuardado.marcaModelo
          })
        });
      });
      this.editarItem = true;
    }
  }
  public compareWith(object1: Ubicacion, object2: Ubicacion): boolean {
    return object1 && object2 && object1.id === object2.id;
  }
  eliminarItem(id: string) {
    this.itemService.deleteItem(id).subscribe(() => {
      this.itemService.obtenerItems();
    });
  }
  ngOnDestroy(): void {
  }
  //obtiene el id  y el id de la ubicacion de la url
  obtenerId() {
    this.ubicacionId=  this.rutaActiva.snapshot.params['ubicacionId'];
    console.log(`id ubicacion: ${this.ubicacionId}`);
    this.id = this.rutaActiva.snapshot.params['id'];
  }

  mostrarAlerta(mensaje: string) {
    this.mensajeItemAnadido = mensaje;
    this.mostrarCarta = true;
  }
}
