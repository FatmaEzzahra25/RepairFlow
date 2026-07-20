import { TestBed } from '@angular/core/testing';

import { ReparateurService } from './reparateur';

describe('Reparateur', () => {
  let service: ReparateurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReparateurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
