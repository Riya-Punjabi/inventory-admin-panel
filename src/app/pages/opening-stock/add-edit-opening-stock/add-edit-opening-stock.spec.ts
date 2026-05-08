import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditOpeningStock } from './add-edit-opening-stock';

describe('AddEditOpeningStock', () => {
  let component: AddEditOpeningStock;
  let fixture: ComponentFixture<AddEditOpeningStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditOpeningStock],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditOpeningStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
