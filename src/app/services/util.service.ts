import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {
	constructor() {}

	private readonly DROPDOWN_KEY: string = 'id';

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
}
