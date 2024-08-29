import { trigger, style, transition, animate, query, animateChild } from '@angular/animations';

export const DirectivesAnimation = [
	trigger('directivesAnimation', [transition(':enter, :leave', [query('@*', animateChild())])]),
];

export const FadeInOut = [
	trigger('fadeInOut', [
		transition(':enter', [style({ opacity: 0 }), animate('.4s ease-in', style({ opacity: 1 }))]),
		transition(':leave', [style({ opacity: 1 }), animate('.6s ease-out', style({ opacity: 0 }))]),
	]),
];
