<script>
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';

	// Declar variables.
	export let field = {};

	let isTypeNumber = false;

	// Dispatch.
	const dispatch = createEventDispatcher();

	// Change value.
	function onChangeValue(event) {
		const value = isTypeNumber ? parseInt(event.target.value) : event.target.value;
		dispatch('changeValue', {
			name: field.name,
			value
		});
	}

	// Insert default value.
	onMount(() => {
		if (field.extra.options.length > 0) {
			const value = field.value ? field.value : field.extra.options[0].value;
			isTypeNumber = !isNaN(value);
			dispatch('changeValue', {
				name: field.name,
				value
			});
		}
	});

	// Lifecycle.
	afterUpdate(() => {
		field.value = field.value == undefined ? null : field.value;
	});
</script>

{#each field.extra.options as option, i}
	<div class={field.extra.aligne === 'inline' ? 'form-check form-check-inline' : 'form-check'}>
		<input
			type="radio"
			class={field.classes}
			name={field.name}
			value={option.value}
			checked={option.value === field.value}
			on:input={onChangeValue}
		/>
		<span>{option.title}</span>
	</div>
{/each}
