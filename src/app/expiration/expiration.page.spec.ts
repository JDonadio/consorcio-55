import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpirationPage } from './expiration.page';

describe('ExpirationPage', () => {
  let component: ExpirationPage;
  let fixture: ComponentFixture<ExpirationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpirationPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpirationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
