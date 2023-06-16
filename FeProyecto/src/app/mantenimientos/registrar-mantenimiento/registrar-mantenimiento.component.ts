import { Component, OnDestroy, OnInit } from '@angular/core';
import { MantenimientoService } from '../mantenimientos/mantenimientos.service';
import { FormBuilder, Validators } from '@angular/forms';
import { UbicacionesService } from 'src/app/ubicaciones/ubicaciones/ubicaciones.service';
import { Ubicacion } from 'src/app/ubicaciones/ubicaciones/ubicacion.model';
import { Mantenimiento } from '../mantenimientos/mantenimiento.model';
import { Item } from 'src/app/items/items/item.model';
import { ItemsService } from 'src/app/items/items/items.service';
import { ActivatedRoute, Router } from '@angular/router';
import 'moment/locale/es';
import { Utils } from 'src/app/paginator';
import { DatePipe } from '@angular/common';
import { MatCalendarCellClassFunction, MatCalendarCellCssClasses } from '@angular/material/datepicker';
declare var require: any;
@Component({
  selector: 'app-registrar-mantenimiento',
  templateUrl: './registrar-mantenimiento.component.html',
  styleUrls: ['./registrar-mantenimiento.component.css'],
  providers: [DatePipe],
})
export class RegistrarMantenimientoComponent implements OnInit, OnDestroy {
  selectItem!: Item;
  selectCorregido!: string;

  ubicacion!: Ubicacion;
  id!: string;
  ubicacionId!: string;
  mantenimientoGuardado!: Mantenimiento;
  accion!: string;
  mantenimientoForm: any;
  items: Item[] = [];
  mantenimientoDef: any;
  itemDef!: Item;

  //controlar si esta elegido el item
  corregido: string | undefined = undefined;
  item!: Item;
  util: any;
  //Variables de Fecha
  dateClass: MatCalendarCellClassFunction<Date>;
  fechaSugeridaCoincide = false;

  //Card Alert
  mostrarCarta: boolean = false;
  mensajeItemAnadido: string = "";

  constructor(
    private mantenimientoService: MantenimientoService,
    private ubicacionesService: UbicacionesService,
    private fb: FormBuilder,
    private itemsService: ItemsService, private rutaActiva: ActivatedRoute, private router: Router
  ) {
    this.mantenimientoForm = this.fb.group({
      elementos: ['', Validators.required],
      descripcion: ['', Validators.required],
      estado: ['', Validators.required],
      corregido: ['', Validators.required],
      periocidad: ['', Validators.required],
      fechaMantenimiento: ['', Validators.required],
      observaciones: [''],
    });
  }

  goBack() {
    window.history.back();
  }
  /*
  * Este método es llamado cuando el usuario hace click en el botón de añadir/editar mantenimientos del formulario
  */
  registrarEditarMantenimiento() {
    if (this.mantenimientoGuardado == undefined) {
      console.log('AÑADIENDO MANTENIMIENTO');
      const MANTENIMIENTO: Mantenimiento = {
        id: '',
        descripcion: this.mantenimientoForm.get('descripcion')?.value,
        estado: this.mantenimientoForm.get('estado')?.value,
        corregido: this.mantenimientoForm.get('corregido')?.value,
        observaciones: this.mantenimientoForm.get('observaciones')?.value,
        imagenes: [''],
        periocidad: '',
        fecha: this.mantenimientoForm.get('fechaMantenimiento')?.value,
        item_id: this.mantenimientoForm.get('elementos')?.value,
        ubicacion_id: this.ubicacionId,
      };

      this.selectCorregido == 'true'
        ? (MANTENIMIENTO.corregido = true)
        : (MANTENIMIENTO.corregido = false);

      //OBTENER ITEM DEL MANTENIMIENTO para asignarle la periocidad
      this.itemsService
        .obtenerItemById(MANTENIMIENTO.item_id)
        .subscribe((item) => {
          this.itemDef = item;
           //AÑADIR PERIOCIDAD
          MANTENIMIENTO.periocidad = item.periocidad
          //AÑADIR MANTENIMIENTO
          this.mantenimientoService
            .guardarMantenimiento(MANTENIMIENTO)
            .subscribe((dato: any) => {
              this.mantenimientoDef = dato;
              MANTENIMIENTO.id = dato._id;
              //actualizamos el Mantenimiento recién creado para asignarle el id que devuelve el Backend
              this.mantenimientoService
                .updateMantenimiento(MANTENIMIENTO.id, this.mantenimientoDef)
                .subscribe(() => { });
              //buscamos la ubicación a la que pertenece ese Mantenimiento para añadirlo a la lista de Mantenimientos
              this.ubicacionesService
                .obtenerUbicacion(this.ubicacionId)
                .subscribe((ubicacion: Ubicacion) => {
                  this.ubicacion = ubicacion;
                  this.ubicacionesService.updateMantenimiento(
                    this.ubicacionId,
                    ubicacion,
                    this.mantenimientoDef,
                    MANTENIMIENTO.id
                  );
                });
            });
        });
        this.mostrarAlerta('Mantenimiento Añadido');
    } else {
      //modificamos item
      this.mantenimientoService.obtenerMantenimientoById(this.id).subscribe((mant: Mantenimiento) => {
        const MANTENIMIENTO: Mantenimiento = {
          id: this.id,
          descripcion: this.mantenimientoForm.get('descripcion')?.value,
          estado: this.mantenimientoForm.get('estado')?.value,
          corregido: this.mantenimientoForm.get('corregido')?.value,
          observaciones: this.mantenimientoForm.get('observaciones')?.value,
          imagenes: [''],
          periocidad: mant.periocidad,
          fecha: this.mantenimientoForm.get('fechaMantenimiento')?.value,
          item_id: this.mantenimientoForm.get('elementos')?.value,
          ubicacion_id: this.ubicacionId,
        };
        //comprueba el valor del input select y le asigna valor a la propiedad corregido que es de tipo Boolean
        this.selectCorregido == 'true' ? (MANTENIMIENTO.corregido = true) : (MANTENIMIENTO.corregido = false);

        this.mantenimientoService.updateMantenimiento(this.id, MANTENIMIENTO).subscribe(() => { });

        this.ubicacionesService
          .obtenerUbicacion(this.ubicacionId)
          .subscribe((ubicacion: Ubicacion) => {
            this.util.mostrar2(`Editar Mantenimiento - ${ubicacion.nombre}`);
            this.ubicacion = ubicacion;
            this.ubicacionesService.updateMantenimiento(
              this.ubicacionId,
              ubicacion,
              MANTENIMIENTO,
              MANTENIMIENTO.id
            );
          });

      })
      this.mostrarAlerta('Mantenimiento Editado');
    }
    //establecemos un Timeout para que tras haber añadido o actualizado el Mantenimiento cargue la lista de mantenimientos
    setTimeout(() => {
      this.router.navigate(['/mantenimientos', this.ubicacionId]);
    }, 2000)
  }
  /*
  *Este método hace uso de la libreria Moment para sugerir la fecha del mantenimiento según la periocidad asignada al ítem
  */

  fechaSugerida(periocidad: string) {
    const moment = require('moment');
    var date = moment();
    date.format();

    switch (periocidad) {
      case 'diaria':
        date.add(1, 'days');
        break;
      case 'semanal':
        date.add(7, 'days');
        break;
      case 'mensual':
        date.add(1, 'months');
        break;
      case 'trimestral':
        date.add(3, 'months');
        break;
    }

    this.fechaSugeridaCoincide = false;

    var Parsedate = new DatePipe('en-US').transform(date, 'yyyy-MM-dd');
    console.log('Fecha3: ' + Parsedate);

    this.dateClass = (cellDate: Date): MatCalendarCellCssClasses => {
      if (moment(cellDate).format('YYYY-MM-DD') === Parsedate) {
        this.fechaSugeridaCoincide = true;
        return 'highlight-date-sugerida';
      }
      return '';
    };

    (<HTMLInputElement>(
      document.getElementsByName('fechaMantenimiento')[0]
    )).placeholder = `Fecha sugerida: ${Parsedate}`;
  }

/*
* Este método se ejecuta al seleccionar un ítem para hacerle un mantenimiento
*/
  onSelected(ob: any) {
    let idForm = ob.value;
    console.log(`id: ${ob.value}`)
    this.itemsService.obtenerItemById(idForm).subscribe((item: Item) => {
      this.mantenimientoForm.patchValue({
        periocidad: item.periocidad,
      });
      this.fechaSugerida(item.periocidad);
    });
  }

  ngOnInit(): void {
    //Inicializa una instancia de la clase Utils para modificar la cabecera de la página
    this.util = new Utils();
    //Obtenemos los id de la ruta
    this.obtenerId();
    this.obtenerUbicacionId();
    /*
    * lógica para controlar si estamos añadiendo un mantenimiento o modificandolo
    */
    if (this.id != undefined && this.ubicacionId != undefined) {
      this.esEditar();
    } else if (this.ubicacionId != undefined && this.id == undefined) {
      this.ubicacionesService
        .obtenerUbicacion(this.ubicacionId)
        .subscribe((ubicacion) => {
          this.util.mostrar2(`Añadir Mantenimiento - ${ubicacion.nombre}`);
          this.accion= "Añadir"
          this.items = ubicacion.items;
          this.items.forEach(element => {
              console.log(element.marcaModelo)
          });
        });
    }
  }
  ngOnDestroy(): void { }
  /*
  *Este método se encarga de parsear una fecha recibida como parámetro.
  */
  parse(date: Date) {
    var fecha = new Date(date)
    return fecha.toLocaleDateString("es-ES")
  }
  esEditar() {
    this.ubicacionesService
          .obtenerUbicacion(this.ubicacionId)
          .subscribe((ubicacion: Ubicacion) => {
            this.util.mostrar2(`Editar Mantenimiento - ${ubicacion.nombre}`);
          });
    this.accion = 'Editar';
    this.mantenimientoService
      .obtenerMantenimientoById(this.id)
      .subscribe((dato: Mantenimiento) => {
        this.mantenimientoGuardado = dato;
        //comprobamos si el item a mantener está coregido o no y lo asignamos al formulario
        this.mantenimientoGuardado.corregido == true ? (this.corregido = 'true') : (this.corregido = 'false');

        this.itemsService.obtenerItemById(this.mantenimientoGuardado.item_id).subscribe((item: Item) => {
          this.itemDef = item;
          this.items[0] = item;
          this.mantenimientoForm.patchValue({
            elementos: item['_id'],
            periocidad: item.periocidad,
            descripcion: this.mantenimientoGuardado.descripcion,
            estado: this.mantenimientoGuardado.estado,
            corregido: this.corregido,
            fechaMantenimiento: this.mantenimientoGuardado.fecha,
            observaciones: this.mantenimientoGuardado.observaciones,
          });
          this.fechaSugerida(item.periocidad);
        });
      });
  }

  obtenerUbicacion(id: string) {
    this.ubicacionesService
      .obtenerUbicacion(id)
      .subscribe((ubicacion: Ubicacion) => {
        this.ubicacion = ubicacion;
      });
  }
  //obtiene el id
  obtenerId() {
    this.id = this.rutaActiva.snapshot.params['id'];
  }
  //obtiene el id de la ubicacion de la url
  obtenerUbicacionId() {
    this.ubicacionId = this.rutaActiva.snapshot.params['ubicacionId'];
  }

  mostrarAlerta(mensaje: string) {
    this.mensajeItemAnadido = mensaje;
    this.mostrarCarta = true;
  }
  obtenerMarca(string:any){
    /* this.itemsService.obtenerItemById(string).subscribe((item)=>{
      return item.marcaModelo
    }) */
  }
}
