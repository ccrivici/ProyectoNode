import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuertoComponent } from './puerto.component';

describe('PuertoComponent', () => {
  let component: PuertoComponent;
  let fixture: ComponentFixture<PuertoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuertoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuertoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
