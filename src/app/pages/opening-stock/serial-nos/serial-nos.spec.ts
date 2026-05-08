import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerialNos } from './serial-nos';

describe('SerialNos', () => {
  let component: SerialNos;
  let fixture: ComponentFixture<SerialNos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SerialNos],
    }).compileComponents();

    fixture = TestBed.createComponent(SerialNos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
