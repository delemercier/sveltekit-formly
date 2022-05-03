<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { validate } from '../lib/validation.js';
	import { valuesForm } from '../lib/stores.js';
	import { evaluate, getDateFromExpr, dateFormatCorrect, hasChanged } from '../lib/helpers.js';

	// Import components.
	import Input from './Input.svelte';
	import Textarea from './Textarea.svelte';
	import Select from './Select.svelte';
	import AutoComplete from './AutoComplete.svelte';
	import Radio from './Radio.svelte';
	import Checkbox from './Checkbox.svelte';
	import Table from './Table.svelte';
	import { clsx } from '../lib/helpers';

	// Declar variables;
	export let fields = [];
	export let rules = [];
	export let messages = {};
	export let classes = {};
	export let data = undefined;
	export let action = 'new';

	let sections = {
		undefined: 'true'
	};
	let forceSections = {
		undefined: 'true'
	};

	let defaultMessages = {
		required: 'Field {name} required',
		min: 'Min is {1}',
		max: 'Max is {1}',
		between: 'Between {1} and {2}',
		equal: 'Must be equal to {1}',
		length: 'Must have {1} characters',
		email: 'Email not valid',
		types: 'Must to allowed file types',
		url: 'url not valid',
		maxsize: 'This file has size more than max size',
		date: 'Date is not valid: {1}',
		confirm: 'value must be the same as {1}',
		custom_rule: 'Error'
	};

	let defaultClasses = {
		message: '',
		section: '',
		checkbox: 'checkbox',
		input: 'input',
		textarea: 'textarea',
		select: 'select',
		radio: 'radio',
		autocomplete: {
			input: ''
		},
		table: {
			table: 'table',
			thead: '',
			tbody: '',
			th: '',
			tr: '',
			td: '',
			input: 'input',
			addrow: '',
			addrowtext: '',
			deleterow: '',
			deleterowtext: ''
		}
	};

	let components = {
		autocomplete: AutoComplete,
		checkbox: Checkbox,
		input: Input,
		textarea: Textarea,
		radio: Radio,
		select: Select,
		table: Table
	};

	let isValidForm = true;
	let values = {};
	let itemsField = [];
	$: listFields = itemsField;

	const defaultAttributes = {
		type: 'text',
		classes: '',
		autoCompleteClasses: {},
		tableClasses: {},
		placeholder: '',
		disabled: 'false',
		readonly: 'false',
		ignored: 'false',
		visible: 'true',
		canUpdate: 'true'
	};

	const isNew = () => action === 'new';

	// refresh fields
	const refreshFields = async (fields, eventDetail = undefined) => {
		return await Promise.all(
			fields.map(async (field) => {
				if (eventDetail) {
					if (field.name == eventDetail.name) {
						field.value = eventDetail.value;
						field.dirty = true;
					}
				}

				values = { ...values, [field.name]: field.value };

				if (
					evaluate(field.attributes.ignored, values) === true ||
					(field.dirty === false && !field.value)
				) {
					delete values[field.name];
				}

				field.values = values;
				field.rules = field.rules || [];

				if (isNew() || hasChanged(field.name, data, values)) {
					field = await validate(field, field.values, rules);
				}

				return field;
			})
		);
	};

	// Change values.
	const changeValueHandler = async (event) => {
		values = {
			...values,
			[event.detail.name]: event.detail.value
		};

		let mylist = await refreshFields(listFields, event.detail);

		isValidForm = !mylist.some((item) => item.validation.dirty === true);

		const delta = {};
		for (const key in values) {
			if (hasChanged(key, data, values)) {
				delta[key] = values[key];
			}
		}

		valuesForm.set({ values: delta, valid: isValidForm });
		itemsField = mylist;
	};

	// Lifecycle.
	onMount(async () => {
		let section = undefined;
		for (const field of fields) {
			if (field.type === 'section') {
				section = field.name;
				sections[field.name] = field.open || 'true';
				forceSections[field.name] = undefined;
			} else {
				field.section = section;
			}
		}

		// set default classes enriched with classes passed in parameters
		for (const c in classes) {
			if (typeof classes[c] === 'string') {
				defaultClasses[c] = clsx(defaultClasses[c], classes[c]);
			} else {
				for (const subclass in classes[c]) {
					defaultClasses[c][subclass] = clsx(defaultClasses[c][subclass], classes[c][subclass]);
				}
			}
		}

		// on mount, set field default attributes
		for (const field of fields) {
			field.attributes = { ...defaultAttributes, ...(field.attributes || {}) };
			field.messages = { ...defaultMessages, ...messages, ...field.messages };
			field.classes = defaultClasses[field.type];
			field.dirty = false;
			field.validation = { errors: [], dirty: false };

			if (field.type === 'table') {
				if (!field.rules) field.rules = [];

				field.rules = [
					...field.extra.options.flatMap((option) =>
						option.rules.map((r) => `${option.name}:${r}`)
					),
					...field.rules.map((rule) => 'table:' + rule)
				];
			}

			if (field.attributes.type === 'date' && isNew()) {
				if (field.value && !dateFormatCorrect(field.value)) {
					const [now, moment] = field.value.split(':');
					field.value = getDateFromExpr(now, moment).toISOString().slice(0, 10);
				}
			}

			if (field.value && isNew()) {
				values[field.name] = field.value;
			}
		}

		// set defaultValue from valueExpr
		for (const field of fields) {
			if (field.valueExpr && isNew()) {
				field.value = evaluate(field.valueExpr, values);
				values[field.name] = field.value;
			}
		}

		if (!isNew()) {
			values = {};
			for (const field of fields) {
				if (!evaluate(field.attributes.ignored) && data) {
					const value = data[field.name];
					if (typeof value === 'string' || value === undefined) {
						field.value = value || null;
					} else {
						field.value = JSON.parse(JSON.stringify(value)) || null;
					}
				}

				if (field.attributes.canUpdate === 'false') {
					field.attributes.readonly = 'true';
					field.attributes.disabled = 'true';
				}
				if (field.attributes.canUpdate === 'once' && field.value) {
					field.attributes.readonly = 'true';
					field.attributes.disabled = 'true';
				}
			}
		}

		values.action = action;

		const mylist = await refreshFields(fields);

		isValidForm = !mylist.some((item) => item.validation.dirty === true);
		valuesForm.set({ values, valid: isValidForm });
		itemsField = mylist;
	});

	function toggleSection(section, lock) {
		if (evaluate(lock, values)) return;
		if (forceSections[section] === undefined)
			forceSections[section] = !evaluate(sections[section], values);
		else forceSections[section] = !forceSections[section];
	}

	const interpolate = (str, args, name) => {
		return str.replace('{name}', name).replace(/{([0-9]+)}/g, function (match, index) {
			return typeof args[index] == 'undefined' ? match : args[index];
		});
	};

	const print = (field, error) => {
		let msg = field.messages[error];
		let fieldName = field.name;

		if (error.includes(':')) {
			const [name, err] = error.split(':');
			fieldName = name;
			msg = field.messages[err];
		}

		if (msg === undefined) return '';
		for (const rule of field.rules) {
			if (rule.startsWith(error)) {
				return interpolate(msg, rule.split(':'), fieldName);
			}
		}
		return msg;
	};
</script>

{#each listFields as field (field.name)}
	{#if field.type === 'section'}
		<div
			class={field.classes}
			style="cursor:pointer"
			id={field.name}
			on:click={() => toggleSection(field.name, field.lock)}
		>
			{field.title}
		</div>
	{:else if evaluate(field.attributes.visible, values) && forceSections[field.section] === undefined ? evaluate(sections[field.section], values) : forceSections[field.section]}
		<div transition:fly={{ y: -20, duration: 250 }}>
			<!-- Label -->
			{#if field.attributes && field.attributes.label}
				<label for={field.name} style="display: block">
					<span data-tooltip={field.description}>
						{field.attributes.label}
					</span>
					<span>*</span>
				</label>
			{/if}

			<svelte:component this={components[field.type]} {field} on:changeValue={changeValueHandler} />

			<!-- Error messages -->
			{#if !isValidForm}
				{#if field?.dirty && field.validation.errors.length > 0}
					{#each field.validation.errors as error}
						<div class={classes.message}>
							{print(field, error)}
						</div>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
{/each}

<style>
	[data-tooltip] {
		position: relative;
		z-index: 2;
	}

	[data-tooltip]:before,
	[data-tooltip]:after {
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: 0.1s ease-out;
		transform: translate(-50%, 5px);
	}

	[data-tooltip]:before {
		position: absolute;
		bottom: 100%;
		left: 50%;
		margin-bottom: 5px;
		padding: 7px;
		width: 100%;
		min-width: 300px;
		max-width: 400px;
		background-color: #000;
		background-color: hsla(0, 0%, 20%, 1);
		color: #fff;
		content: attr(data-tooltip);
		text-align: center;
		font-size: 14px;
		line-height: 1.2;
		transition: 0.01s ease-out;
	}

	[data-tooltip]:after {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 0;
		border-top: 5px solid #000;
		border-top: 5px solid hsla(0, 0%, 20%, 0.9);
		border-right: 5px solid transparent;
		border-left: 5px solid transparent;
		content: ' ';
		font-size: 0;
		line-height: 0;
	}

	[data-tooltip]:hover:before,
	[data-tooltip]:hover:after {
		visibility: visible;
		opacity: 1;
		transform: translate(-15%, 0);
	}
	[data-tooltip='false']:hover:before,
	[data-tooltip='false']:hover:after {
		visibility: hidden;
		opacity: 0;
	}
</style>
