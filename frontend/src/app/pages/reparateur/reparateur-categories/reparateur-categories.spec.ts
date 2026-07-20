import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurCategoriesComponent } from './reparateur-categories';

describe('ReparateurCategories', () => {
  let component: ReparateurCategoriesComponent;
  let fixture: ComponentFixture<ReparateurCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurCategoriesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurCategoriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
