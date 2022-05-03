<script>
	import { createEventDispatcher } from 'svelte';
	import { clickOutside, isRequired, clsx } from '../lib/helpers';

	// Declar variables.
	export let field = {};
	const defaultAttributes = {
		spellcheck: false,
		autocorrect: 'off',
		max: 50,
		width: '400px',
		placeholder: ''
	};
	const fieldAttributes = field.attributes ? field.attributes : {};
	field.attributes = { ...defaultAttributes, ...fieldAttributes };

	const defaultExtra = {
		options: [],
		multiple: false
	};
	const fieldExtra = field.extra ? field.extra : {};
	field.extra = { ...defaultExtra, ...fieldExtra };

	let optionsFiltered = [...field.extra.options.map((option) => option.value)];
	field.value = field.value ? field.value : field.extra.multiple ? [] : null;
	let valueTitle = field.extra.options.reduce(
		(obj, item) => ((obj[item.value] = item.title), obj),
		{}
	);
	let showOptions = false;
	let search = null;

	const dispatch = createEventDispatcher();

	const refresh = (e) => {
		if (e) {
			search = e.target.value;
		}

		showOptions = e !== undefined;

		optionsFiltered = field.extra.options
			.filter((entry) => {
				return Object.values(entry).some((val) => typeof val === 'string' && val.includes(search));
			})
			.map((option) => option.value);

		// Affect values.
		dispatch('changeValue', {
			name: field.name,
			value: field.value
		});
	};

	// Select item.
	const onSelectItem = (item) => {
		field.extra.multiple ? (field.value = [...field.value, item]) : (field.value = item);
		search = '';
		refresh();
	};

	// Delete tag
	const deleteTag = (option) => {
		field.value = field.extra.multiple ? field.value.filter((v) => v !== option) : null;
		refresh();
	};

	function optionsHeight() {
		if (field.extra.multiple) {
			return Math.min((optionsFiltered.length - field.value?.length) * 20, 200) + 'px';
		} else {
			const selected = field.value === null ? 0 : 1;
			return Math.min((optionsFiltered.length - selected) * 20, 200) + 'px';
		}
	}

	function doShowOptions(option, index, field) {
		if (field.extra.multiple) {
			return index < field.attributes.max + field.value.length && !field.value.includes(option);
		} else {
			return index < field.attributes.max && (field.value === null || !field.value === option);
		}
	}
</script>

<div
	style="width: {field.attributes.width}"
	use:clickOutside
	on:click_outside={() => (showOptions = false)}
>
	{#if field.extra.multiple}
		{#each field.value as option}
			<span class="pointer badge" on:click={() => deleteTag(option)}>{valueTitle[option]}</span>
		{/each}
	{:else if field.value}
		<span class="pointer w-100" on:click={() => deleteTag(field.value)}
			>{valueTitle[field.value]}</span
		>
	{/if}

	{#if field.extra.multiple || field.value === null}
		<input
			id={field.name}
			type="text"
			class={clsx('w-100', field.classes.input)}
			spellcheck={field.attributes.spellcheck}
			autocorrect={field.attributes.autocorrect}
			autocomplete="off"
			placeholder={field.attributes.placeholder}
			class:formly-required={isRequired(field) && !field.value}
			on:keyup={refresh}
			on:click={() => (showOptions = !showOptions)}
			value={search}
		/>
	{/if}

	{#if showOptions && optionsFiltered.length > 0}
		<div class="w-100" style="padding: 0px 4px 0px 4px;height: {optionsHeight()}; overflow-y: auto">
			{#each optionsFiltered as option, i}
				{#if doShowOptions(option, i, field)}
					<div
						class="pointer"
						on:click={() => {
							onSelectItem(option);
						}}
					>
						<span>{valueTitle[option]}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	input:focus {
		outline: none;
	}
	.pointer {
		cursor: pointer;
	}
	.w-100 {
		width: 100%;
	}
</style>
