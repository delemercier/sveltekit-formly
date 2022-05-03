<script lang="ts">
	import { get } from 'svelte/store';
	import { valuesForm, Field } from '$lib/index.js';

	export let fields = [];
	let messages = {
		myrule: 'Field required custom {1}'
	};

	let classes = {
		message: 'error-message',
		section: 'text-xl',
		checkbox: 'color-orange',
		input: '',
		autocomplete: {},
		table: {
			addrowtext: '+',
			deleterowtext: '✖'
		}
	};

	let apiResult = {};

	async function onSubmit() {
		console.log('submit');
		const extdata = get(valuesForm);

		const res = await fetch('/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(extdata.values)
		});

		if (res.ok) {
			try {
				apiResult = await res.json();
			} catch (err) {
				console.log(err);
			}
		}
	}
</script>

<form on:submit|preventDefault={onSubmit} style="display:inline-block; width:50%">
	<Field {fields} {messages} {classes} action="new" />
	<button disabled={!$valuesForm.valid}>Submit</button>
</form>

<div style="display:inline-block; width:45%;vertical-align:top;margin-left:30px">
	<h2>Data produced</h2>
	<pre>{JSON.stringify($valuesForm, null, 2)}</pre>

	<h2>Data after submit POST /add</h2>
	<pre>{JSON.stringify(apiResult, null, 2)}</pre>
</div>

<style>
	:global(.text-xl) {
		font-size: 2em;
	}

	:global(.error-message) {
		color: red;
		font-size: 0.8em;
	}

	:global(.formly-required) {
		border: 1px orange solid;
	}

	:global(input[type='checkbox'].formly-required) {
		border: 1px orange solid;
		box-shadow: inset 1em 1em orange;
	}
</style>
