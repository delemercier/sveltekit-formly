import { writable } from 'svelte/store';

export const valuesForm = writable({
	valid: false,
	values: {}
});
