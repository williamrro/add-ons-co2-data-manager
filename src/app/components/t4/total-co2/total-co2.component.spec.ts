import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalCo2Component } from './total-co2.component';

describe('TotalCo2Component', () => {
	let component: TotalCo2Component;
	let fixture: ComponentFixture<TotalCo2Component>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TotalCo2Component],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TotalCo2Component);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
