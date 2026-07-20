import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientReclamationsComponent } from './client-reclamations';
import {ClientNavbarComponent} from '../client-navbar/client-navbar';

describe('ClientReclamations', () => {
  let component: ClientReclamationsComponent;
  let fixture: ComponentFixture<ClientReclamationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientReclamationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientReclamationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
