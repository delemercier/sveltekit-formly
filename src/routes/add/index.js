import { validateFields } from '$lib/index.js';
import fields from '/src/fields.json';
export async function get() {
	return {
		body: {
			fields
		}
	};
}

export async function post({ request }) {
	const values = await request.json();

	const validation = validateFields(fields, values);

	if (validation.valid) {
		return {
			body: values
		};
	} else {
		return {
			status: 400,
			body: {
				errors: validation.details
			}
		};
	}
}
