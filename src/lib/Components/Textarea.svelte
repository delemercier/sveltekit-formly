<script>
	import { afterUpdate, createEventDispatcher } from 'svelte';

	import { isRequired, evaluate } from '../lib/helpers';

	// Declar variables.
	export let field = {};

	field.attributes = field.attributes ? field.attributes : {};

	// Dispatch.
	const dispatch = createEventDispatcher();

	// Change value.
	function onChangeValue(event) {
		dispatch('changeValue', {
			name: field.name,
			value: event.target.value
		});
	}

	// Insert default value.
	afterUpdate(() => {
		field.value = field.value == undefined ? null : field.value;
	});

	$: rows = (field.value?.match(/\n/g) || []).length + 1 || 1;
</script>

<textarea
	name={field.name}
	class={field.classes}
	class:formly-required={isRequired(field) && !field.value}
	value={field.value}
	placeholder={field.attributes.placeholder}
	required={isRequired(field)}
	disabled={evaluate(field.attributes.disabled, field.values)}
	readonly={evaluate(field.attributes.readonly, field.values)}
	{rows}
	cols={field.attributes.cols || 25}
	on:input={onChangeValue}
/>
