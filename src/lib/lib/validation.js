import * as CoreRules from './rules';

/**
 * Validation fields.
 * @param {object fields to validate} fields
 * @param {object values optional} values
 */
export function validateFields(fields, values = undefined, customRules = undefined) {
	let valid = true;
	let result = Array.isArray(fields)
		? Object.assign(
				{},
				...fields.map((field) => {
					return { [field.name]: field };
				})
		  )
		: { ...fields };

	const details = [];
	const isNew = values.action === 'new';

	Object.keys(result).map((key) => {
		const field = result[key];

		if (field.rules && (isNew || (!isNew && values[key] !== undefined))) {
			field.value = values !== undefined ? values[key] : field.value;
			const statusObjField = validate(field, values, customRules);
			result[key] = { ...result[key], ...statusObjField };
			if (statusObjField.validation.errors.length > 0) {
				valid = false;
				details.push({
					name: field.name,
					rules: statusObjField.validation.errors.map((error) => {
						return {
							name: error,
							message: field.messages ? field.messages[error] : undefined
						};
					})
				});
			}
		} else {
			result[key] = {
				...result[key],
				validation: { errors: [], dirty: false }
			};
		}
	});

	return { ...result, valid, details };
}
/**
 * Validate field by rule.
 * @param {configs field} field
 */
export function validate(field, values, customRules = undefined) {
	let { type, value, rules } = field;

	let valid = true;
	let rule;
	let arrayField;
	let errors = [];

	if (rules) {
		rules.map((validator) => {
			const args = validator.split(/:/g);
			rule = args.shift();

			if (type === 'table') {
				arrayField = rule;
				rule = args.shift();

				if (arrayField === 'table') {
					if (CoreRules[rule] === undefined) {
						valid = customRules[rule].call(null, value, args, values);
					} else {
						valid = CoreRules[rule].call(null, value, args, values);
					}
					if (!valid) {
						if (!errors.includes(rule)) {
							errors = [...errors, arrayField + ':' + rule];
						}
					}
				} else {
					if (value) {
						value.forEach((v) => {
							if (CoreRules[rule] === undefined) {
								valid = customRules[rule].call(null, v[arrayField], args, values);
							} else {
								valid = CoreRules[rule].call(null, v[arrayField], args, values);
							}
							if (!valid) {
								if (!errors.includes(rule)) {
									errors = [...errors, arrayField + ':' + rule];
								}
							}
						});
					}
				}
			} else {
				if (CoreRules[rule] === undefined) {
					valid = customRules[rule].call(null, value, args, values);
				} else {
					valid = CoreRules[rule].call(null, value, args, values);
				}
				if (!valid) {
					errors = [...errors, rule];
				}
			}
		});
		return { ...field, validation: { errors, dirty: errors.length > 0 } };
	} else {
		return { ...field, validation: { errors, dirty: false } };
	}
}
