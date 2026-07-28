import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientLayoutComponent } from './client-layout';

describe('ClientLayout', () => {
  let component: ClientLayoutComponent;
  let fixture: ComponentFixture<ClientLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
