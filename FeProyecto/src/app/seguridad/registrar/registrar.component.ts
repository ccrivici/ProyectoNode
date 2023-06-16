import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SeguridadService } from '../seguridad.service';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class RegistrarComponent implements OnInit {

  constructor(private seguridadService: SeguridadService) { }

  ngOnInit(): void {
  }

  registrarUsuario(form : NgForm){
    console.log(form);
    this.seguridadService.registrarUsuario({
      email: form.value.email,
      password: form.value.password,
      username: form.value.usuario,
      token:''
    })
  }
  mostrar(){
    const input = (<HTMLInputElement>document.getElementById('pswd'));
    if (input.type == "text"){
      input.type="password"
    }else{
      input.type="text"
    }
  }
}
