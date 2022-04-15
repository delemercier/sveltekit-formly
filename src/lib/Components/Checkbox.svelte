<script>
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import { isRequired } from '$lib/lib/helpers';

	// Declar variables.
	export let field = {};
	let values = [];

	let isTypeNumber = false;

	// Dispatch.
	const dispatch = createEventDispatcher();

	// Change value.
	function onChangeValue(event) {
		const name = isTypeNumber ? parseInt(event.target.name) : event.target.name;
		if (event.target.checked === false) {
			const index = values.indexOf(name);
			values.splice(index, 1);
		} else {
			if (!values) values = [];
			values.push(name);
		}

		if (values.length === 0) values = null;

		dispatch('changeValue', {
			name: field.name,
			value: values
		});
	}

	// Insert default
	onMount(() => {
		values = field.value;
		if (field.extra.options.length > 0) {
			for (const item of field.extra.options) {
				if (values?.includes(item.value)) {
					item.checked = true;
					isTypeNumber = !isNaN(item.value);
				}
			}
		}
	});

	// Lifecycle.
	afterUpdate(() => {
		field.value = field.value == undefined ? null : field.value;
	});
</script>

{#each field.extra.options as option, i}
	<div class={field.extra.aligne === 'inline' ? 'form-check-inline' : 'form-check'}>
		<input
			type="checkbox"
			class={field.classes}
			class:formly-required={isRequired(field) && !field.value}
			value={option.value}
			checked={option.checked ? option.checked : false}
			name={option.value}
			on:input={onChangeValue}
		/>
		{#if option.title}
			<span>{option.title}</span>
		{:else}
			<span>{option.value}</span>
		{/if}
	</div>
{/each}
