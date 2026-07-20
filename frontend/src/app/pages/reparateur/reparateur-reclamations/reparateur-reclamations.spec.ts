import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurReclamationsComponent } from './reparateur-reclamations';

describe('ReparateurReclamations', () => {
  let component: ReparateurReclamationsComponent;
  let fixture: ComponentFixture<ReparateurReclamationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurReclamationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurReclamationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
