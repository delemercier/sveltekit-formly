<script>
	import { afterUpdate, createEventDispatcher } from 'svelte';

	import { isRequired, scanValue, evaluate, getDateFromExpr } from '../lib/helpers';

	// Declar variables.
	export let field = {};
	export let mode = 'normal';
	export let value = undefined;

	if (value === undefined) value = field.value;

	function typeAction(node) {
		node.type = field.attributes.type;
	}

	const defaultAttributes = {
		type: 'text',
		min: null,
		max: null,
		step: 1,
		autocomplete: 'off'
	};

	// handle filtered dates with input type = "date"
	if (field.attributes.type === 'date') {
		const dateRule = field.rules.filter((rule) => rule.startsWith('date'))[0] || undefined;
		if (dateRule) {
			const [, expression, moment] = dateRule.split(':');
			const [start, end] = expression
				.replaceAll(' ', '')
				.replaceAll('<=', '')
				.replaceAll('<', '')
				.split('date');

			let startDate = getDateFromExpr(start, moment);
			let endDate = getDateFromExpr(end, moment);

			if (startDate) {
				field.attributes.min = startDate.toISOString().slice(0, 10);
			}
			if (endDate) {
				field.attributes.max = endDate.toISOString().slice(0, 10);
			}
		}
	}

	field.attributes = { ...defaultAttributes, ...field.attributes };
	field.id ? field.id : '';

	// Dispatch.
	const dispatch = createEventDispatcher();

	// Change value field.
	function onChangeValue(event) {
		dispatch('changeValue', {
			name: field.name,
			value: scanValue(field.attributes.type, event.target.value)
		});
	}

	// Lifecycle.
	afterUpdate(() => {
		field.value = field.value == undefined ? null : field.value;
	});
</script>

<input
	use:typeAction
	name={field.name}
	bind:value={field.value}
	id="{field.id}{field.name}"
	class={field.classes}
	class:formly-required={isRequired(field) && !field.value}
	placeholder={field.attributes.placeholder}
	required={isRequired(field)}
	disabled={evaluate(field.attributes.disabled, field.values)}
	readonly={evaluate(field.attributes.readonly, field.values)}
	min={field.attributes.min}
	max={field.attributes.max}
	step={field.attributes.step}
	autocomplete={field.attributes.autocomplete}
	style={mode === 'table' ? 'width:95%' : ''}
	on:input={onChangeValue}
/>
