import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarUbicacionComponent } from './generar-ubicacion.component';

describe('GenerarUbicacionComponent', () => {
  let component: GenerarUbicacionComponent;
  let fixture: ComponentFixture<GenerarUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerarUbicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
