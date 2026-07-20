import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparateurSidebarComponent } from './reparateur-sidebar';
import {ClientNavbarComponent} from '../../client/client-navbar/client-navbar';

describe('ReparateurSidebar', () => {
  let component: ReparateurSidebarComponent;
  let fixture: ComponentFixture<ReparateurSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparateurSidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReparateurSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
