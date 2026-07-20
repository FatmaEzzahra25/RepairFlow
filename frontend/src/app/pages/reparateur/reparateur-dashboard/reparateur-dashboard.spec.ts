import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurDashboardComponent } from './reparateur-dashboard';

describe('ReparateurDashboard', () => {
  let component: ReparateurDashboardComponent;
  let fixture: ComponentFixture<ReparateurDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
