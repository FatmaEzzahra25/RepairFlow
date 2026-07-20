import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProduitsComponent } from './client-produits';
import {ClientNavbarComponent} from '../client-navbar/client-navbar';

describe('ClientProduits', () => {
  let component: ClientProduitsComponent;
  let fixture: ComponentFixture<ClientProduitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProduitsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientProduitsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
