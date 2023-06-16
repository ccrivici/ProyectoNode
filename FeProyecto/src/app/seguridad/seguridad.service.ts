import { Usuario } from './usuario.model';
import { LoginData } from './login-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  private usuario!: any | undefined;
  seguridadCambio = new Subject<boolean>();
  baseUrl = environment.baseUrl;
  private token!: string;

  constructor(private router: Router, private http: HttpClient) { }

  registrarUsuario(usr: any) {
    this.http.post<any>(this.baseUrl + "/usuario/registrar", usr).subscribe((response) => {
      this.token = response.token;
      /* this.usuario = {
        email: response.newUser.email,
        token: response.token,
        password: response.newUser.password,
        username: response.newUser.username,
      }; */
      //este subscription permite mandar a todos los componentes enlazados a este suscription puedan actualizar su estado
      this.seguridadCambio.next(true);
      localStorage.setItem('token', response.token);
      this.router.navigate(['/']);
    })

  }

  login(loginData: LoginData) {
    console.log(
      `email: ${loginData.email}
      psswd: ${loginData.password}
      url: ${this.baseUrl}/usuario/login`
    )

    this.http.post<Usuario>(this.baseUrl + "/usuario/login", loginData).subscribe((response) => {

      console.log("RESPONSE TOKEN "+response.token)
        this.usuario = {
          email: '',
          usuarioID: '',
          nombre: "",
          apellido: "",
          username: '',
          password: '',
          token: response.token
        };
        this.seguridadCambio.next(true);
        localStorage.setItem('token', response.token);
        this.token = response.token;
        this.router.navigate(['/inicio']);



    })

  }

  cargarUsuario() {
    const tokenBrowser = localStorage.getItem('token');
    //si el token no existe, no estas logueado
    if (!tokenBrowser) {
      return;
    }
    this.token = tokenBrowser;
    this.seguridadCambio.next(true);

    this.http.get<Usuario>(this.baseUrl + "/usuario").subscribe((response) => {
      this.token = response.token;
      this.usuario = {
        email: response.email,
        nombre: '',
        apellido: '',
        token: response.token,
        password: '',
        username: response.username,
        usuarioID: ''
      };
      //este subscription permite mandar a todos los componentes enlazados a este suscription puedan actualizar su estado
      this.seguridadCambio.next(true);
      localStorage.setItem('token', response.token);
    });


  }

  obtenerToken(): string {
    return this.token;
  }

  salirSesion() {
    this.usuario = undefined;
    this.seguridadCambio.next(false);
    localStorage.removeItem('token');
    this.token = undefined;
    this.router.navigate(['/login']);
  }

  obtenerUsuario() {
    return { ...this.usuario };
  }

  onSesion() {
    return this.token != null;
  }
}
