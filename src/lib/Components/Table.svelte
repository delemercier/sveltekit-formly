<script>
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { scanValue, clsx } from '../lib/helpers';
	import Input from './Input.svelte';
	import Select from './Select.svelte';

	// Declar variables.
	export let field = {};
	const defaultAttributes = {
		type: 'text',
		min: 0,
		max: 1000000
	};

	field.attributes = { ...defaultAttributes, ...field.attributes };
	field.classes = field.classes ? field.classes : {};

	// Dispatch.
	const dispatch = createEventDispatcher();

	function addRow() {
		if (!field.value) field.value = [];
		if (field.value.length >= field.attributes.max) return;

		const names = field.extra.options.map((option) => option.name);
		field.value = [...field.value, Object.assign({}, ...names.map((n) => ({ [n]: null })))];

		dispatch('changeValue', {
			name: field.name,
			value: scanValue(field.attributes.type, field.value)
		});
	}

	function duplicateRow() {
		if (!field.value) return;
		if (field.value.length >= field.attributes.max) return;

		const lastObject = { ...field.value[field.value.length - 1] };
		field.value = [...field.value, lastObject];

		dispatch('changeValue', {
			name: field.name,
			value: scanValue(field.attributes.type, field.value)
		});
	}

	function deleteRow(_, index) {
		if (field.value.length <= field.attributes.min) return;

		if (field.value.length === 1) {
			field.value = undefined;
		} else {
			field.value.splice(index, 1);
		}

		dispatch('changeValue', {
			name: field.name,
			value: scanValue(field.attributes.type, field.value)
		});
	}

	// Change value field.
	function onChangeValue(event, index, name) {
		const eventField = event.target === null ? event.detail.value : event.target.value;
		let value = eventField == null || isNaN(eventField) ? eventField : parseInt(eventField);
		if (value === 'null') value = null;
		field.value[index][name] = value;

		dispatch('changeValue', {
			name: field.name,
			value: scanValue(field.attributes.type, field.value)
		});
	}
	function getOption(option, value, index) {
		option.value = value;
		option.id = `${field.name}_${index}_`;
		option.classes = clsx(field.classes.input, option.attributes.classes)
		return { ...option };
	}

	// Lifecycle.
	afterUpdate(() => {
		field.value = field.value == undefined ? null : field.value;
	});
</script>

<table class={field.classes.table}>
	<thead class={field.classes.thead}>
		{#each field.extra.options as option}
			<th class={field.classes.th}>
				{option.attributes.label}
			</th>
		{/each}
		<th class={clsx(field.classes.th, field.classes.addrow)} on:click={addRow}
			>{field.classes.addrowtext || '+'}</th
		>

		<th class={clsx(field.classes.th, field.classes.addrow)} on:click={duplicateRow}
			>{field.classes.duplicaterowtext || '//'}</th
		>
	</thead>
	<tbody class={field.classes.tbody}>
		{#if !field.value || field.value.length === 0}
			<tr class={field.classes.tr}>
				{#each field.extra.options as _}
					<td class={field.classes.td}
						><input style="width:95%" type="text" disabled class={field.classes.input} />
					</td>
				{/each}
				<td />
			</tr>
		{:else}
			{#each field.value as row, index}
				<tr class={field.classes.tr} transition:fly={{ x: -100, duration: 500 }}>
					{#each field.extra.options as option}
						<td class={field.classes.td}>
							{#if option.type === 'select'}
								<Select
									field={getOption(option, row[option.name], index)}
									mode="table"
									on:changeValue={(e) => onChangeValue(e, index, option.name)}
								/>
							{:else}
								<Input
									field={getOption(option, row[option.name], index)}
									mode="table"
									on:changeValue={(e) => onChangeValue(e, index, option.name)}
								/>
							{/if}
						</td>
					{/each}
					<td
						class={clsx(field.classes.td, field.classes.deleterow)}
						on:click={(e) => deleteRow(e, index)}
					>
						{field.classes.deleterowtext || 'x'}
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</table>
