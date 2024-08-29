import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DTComponent } from './datatable.component';

describe('DTComponent', () => {
	let component: DTComponent;
	let fixture: ComponentFixture<DTComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DTComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DTComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
