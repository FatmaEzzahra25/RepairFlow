import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProduitsComponent } from './produits';

describe('Produits', () => {
  let component: AdminProduitsComponent ;
  let fixture: ComponentFixture<AdminProduitsComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProduitsComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProduitsComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
