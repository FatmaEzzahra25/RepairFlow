import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurClientsComponent } from './reparateur-clients';

describe('ReparateurClients', () => {
  let component: ReparateurClientsComponent;
  let fixture: ComponentFixture<ReparateurClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurClientsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurClientsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
