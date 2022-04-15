<script>
	import { createEventDispatcher, afterUpdate } from 'svelte';
	import { isRequired, evaluate } from '../lib/helpers';

	// Declar variables.
	export let field = {};
	export let mode = 'normal';

	const fieldAttributes = field.attributes ? field.attributes : {};
	field.attributes = { ...fieldAttributes };

	field.value ? field.value : field.extra.options[0].value;

	// Dispatch.
	const dispatch = createEventDispatcher();

	function updateValue(value) {
		if (value === 'null') {
			value = null;
		}
		dispatch('changeValue', {
			name: field.name,
			value: value
		});
	}

	// Change value.
	function onChangeValue(event) {
		updateValue(event.target.value);
	}

	// Lifecycle.
	afterUpdate(() => {
		field.value = field.value == undefined ? null : field.value;
		if ('cascaded' in field.extra) {
			const parentValue = field.values[field.extra.cascaded];
			const parentValueFromSelected =
				field.extra.options
					.filter((option) => option.value === field.value)
					.map((option) => option.cascaded)[0] || undefined;

			if (field.value !== null && parentValue !== parentValueFromSelected) {
				updateValue(null);
			}
		}
	});
</script>

<select
	name={field.name}
	id="{field.id || ''}_{field.name}"
	style={mode === 'table' ? 'width:95%' : ''}
	class={field.classes}
	class:formly-required={isRequired(field) && !field.value}
	required={isRequired(field)}
	disabled={evaluate(field.attributes.disabled, field.values)}
	autocomplete="off"
	on:change={onChangeValue}
	bind:value={field.value}
>
	{#each field.extra.options as option}
		{#if !option.cascaded || (option.cascaded && option.cascaded === field.values[field.extra.cascaded])}
			{#if option.visible === undefined || evaluate(option.visible, field.values)}
				<option value={option.value}>{option.title}</option>
			{/if}
		{/if}
	{/each}
</select>
