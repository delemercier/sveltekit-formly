<script context="module">
	export async function load({ fetch }) {
		const res = await fetch(`test.json`);
		return res.ok ? { props: { fields: await res.json() } } : {};
	}
</script>

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
		textarea: 'text-xl',
		autocomplete: {},
		table: {
			table: 'table-zebra',
			thead: 'toto',
			addrowtext: '➕',
			deleterowtext: '✖'
		}
	};

	let data = {
		check: [1],
		birthdate: '2022-04-22',
		password: 'test',
		passwordConfirm: 'test',
		textarea: 'coucou',
		email: 'fde',
		country: 'FR',
		city: 'Paris',
		commune: 'Clichy',
		radiofield: 2,
		mytable: [
			{
				field1: 'test1',
				birth: '2022-04-20',
				country: 'FR'
			},
			{
				field1: 'test1',
				birth: '2022-04-20',
				country: 'FR'
			}
		]
	};

	let message = '';
	async function onSubmit() {
		const extdata: any = get(valuesForm);
		if (extdata.valid) {
			message = 'Congratulation! now your form is valid';
		} else {
			message = 'Your form is not valid!';
		}

		const res = await fetch('test.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(extdata.values)
		});
		const json = await res.json();
		console.log(json);
	}
</script>

<pre>{JSON.stringify($valuesForm, null, 2)}</pre>

<form on:submit|preventDefault={onSubmit}>
	<Field {fields} {messages} {classes} action="new" />
	<button disabled={!$valuesForm.valid}>Submit</button>
</form>

<style>
	:global(.text-xl) {
		color: red;
	}

	:global(.error-message) {
		color: red;
	}

	:global(.formly-required) {
		border: 1px orange solid;
	}

	:global(input[type='checkbox'].formly-required) {
		border: 1px orange solid;
		box-shadow: inset 1em 1em orange;
	}
</style>
