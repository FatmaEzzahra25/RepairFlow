import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurLayoutComponent } from './reparateur-layout';

describe('ReparateurLayout', () => {
  let component: ReparateurLayoutComponent;
  let fixture: ComponentFixture<ReparateurLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
