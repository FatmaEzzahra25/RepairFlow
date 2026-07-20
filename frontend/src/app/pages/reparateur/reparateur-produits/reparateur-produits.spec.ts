import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurProduitsComponent } from './reparateur-produits';

describe('ReparateurProduits', () => {
  let component: ReparateurProduitsComponent;
  let fixture: ComponentFixture<ReparateurProduitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurProduitsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurProduitsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
