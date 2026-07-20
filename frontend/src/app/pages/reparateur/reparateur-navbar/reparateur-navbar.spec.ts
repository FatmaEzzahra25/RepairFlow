import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurNavbarComponent } from './reparateur-navbar';

describe('ReparateurNavbar', () => {
  let component: ReparateurNavbarComponent;
  let fixture: ComponentFixture<ReparateurNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurNavbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurNavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
