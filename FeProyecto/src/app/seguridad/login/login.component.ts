import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SeguridadService } from '../seguridad.service';
import { HttpClient } from '@angular/common/http';
import { Utils } from 'src/app/paginator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  util:Utils;
  constructor(private seguridadService: SeguridadService, private http: HttpClient) { }
  ngOnInit(): void {
    this.util = new Utils();
    this.util.mostrar2(`Iniciar Sesión`);
  }

  loginUsuario(form: NgForm) {
    this.seguridadService.login({
      email:  form.value.email,
      password: form.value.password
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
