import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSidebarComponent } from './client-sidebar';
import {ClientNavbarComponent} from '../client-navbar/client-navbar';

describe('ClientSidebar', () => {
  let component: ClientSidebarComponent;
  let fixture: ComponentFixture<ClientSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
