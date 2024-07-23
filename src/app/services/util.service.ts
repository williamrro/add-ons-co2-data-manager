import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {
	constructor() {}

	public readonly DROPDOWN_KEY: string = 'id';

	formatValueForDropdown(list: any[], idNode?: string, labelNode?: string) {
		if (list && list.length > 0) {
			return list.map((val: any) => ({
				[this.DROPDOWN_KEY]: idNode ? val[idNode] : val,
				itemName: labelNode ? val[labelNode] : val,
			}));
		}
		return [];
	}

	formatT4SearchPayload(searchParams: any) {
		const modifiedSearchParams = {};
		if (searchParams && Object.keys(searchParams).length > 0) {
			Object.keys(searchParams).map((key: string) => {
				const value = searchParams[key];
				modifiedSearchParams[key] = value && value.length > 0 ? value.map((val: any) => val[this.DROPDOWN_KEY]) : [];
			});
		}
		return modifiedSearchParams;
	}

	resetDropdownPosition() {
		setTimeout(() => {
			try {
				const valuesListMargin = 12;

				// Body height
				const bodyHeight = document.body.clientHeight;
				// List of opened dropdown values list elements
				const openedDropdownElems = Array.from(document.querySelectorAll('div.dropdown-list:not([hidden])'));

				if (openedDropdownElems.length > 0) {
					openedDropdownElems.forEach((elem: any) => {
						// Rect of actual dropdown element
						const dropdownHeaderElemRect = elem.previousElementSibling.getBoundingClientRect();
						// Rect of opened dropdown values list element
						const openedDropdownElemRect = elem.getBoundingClientRect();
						// Expected position top value of opened dropdown values list element
						const valuesListToOpenTop = dropdownHeaderElemRect.top + dropdownHeaderElemRect.height + valuesListMargin;
						// Check if sum of opened dropdown values list element top and height exceeds available body height
						if (valuesListToOpenTop + openedDropdownElemRect.height > bodyHeight) {
							// Set top of opened dropdown values list element, such a way that the element will be placed just above the actual dropdown element.
							elem.style.top = `${dropdownHeaderElemRect.top - valuesListMargin - openedDropdownElemRect.height}px`;
						} else {
							// Set the calculated position top value of opened dropdown values list element
							elem.style.top = `${valuesListToOpenTop}px`;
						}
					});
				}
			} catch (ex) {}
		}, 10);
	}
}
