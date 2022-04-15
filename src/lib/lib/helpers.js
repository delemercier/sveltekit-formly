const isRequired = (field) => field.rules.includes('required');

function isArray(arr) {
	return Array.isArray(arr);
}

function setAttributes(el, attrs) {
	for (var key in attrs) {
		el.setAttribute(key, attrs[key]);
		el.setAttribute('autocomplete', 'off');
	}
}

function createDomElement(field) {
	const wrapper = document.createElement('div');
	const el = document.createElement(field.type);
	setAttributes(el, field.attributes);
	wrapper.appendChild(el);
	return wrapper;
}

function addDomElement(container, el) {
	container.appendChild(el);
}

function clickOutside(node) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside', node));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

function scanValue(type, value) {
	let typeOfNumber = ['number', 'range'];
	let newVal = null;
	if (value) {
		newVal = typeOfNumber.includes(type) ? parseInt(value) : value;
	}
	return newVal;
}

function evaluate(expr, values) {
	try {
		return new Function('v', 'return ' + expr)(values);
	} catch (err) {
		console.error(err);
		return undefined;
	}
}

function dateFormatCorrect(val) {
	if (!/^\d\d\d\d-\d\d-\d\d$/.test(val)) {
		return false;
	}
	const [yyyy, mm, dd] = val.split('-').map((p) => parseInt(p));
	const d = new Date(Date.UTC(yyyy, mm - 1, dd));
	return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

function getDateFromExpr(expression, moment = 'currentDay') {
	if (expression === '') return undefined;

	const dateNow = new Date();
	let year = dateNow.getUTCFullYear();
	let month = dateNow.getUTCMonth();
	let day = dateNow.getUTCDate();

	if (moment === 'firstDay') {
		day = 1;
	}
	if (moment === 'lastDay') {
		day = new Date(Date.UTC(year, month + 1, 0)).getDate();
	}

	const expr = expression.replace('now', '');
	if (expr !== '') {
		const op = expr.charAt(0);
		const type = expr.charAt(expr.length - 1).toLowerCase();
		const n = expr.substring(1, expr.length - 1);

		if (op === '+') {
			switch (type) {
				case 'd':
					day += parseInt(n);
					break;
				case 'm':
					month += parseInt(n);
					break;
				case 'y':
					year += parseInt(n);
					break;
			}
		} else if (op === '-') {
			switch (type) {
				case 'd':
					day -= parseInt(n);
					break;
				case 'm':
					month -= parseInt(n);
					break;
				case 'y':
					year -= parseInt(n);
					break;
			}
		} else {
			console.error(`operator ${op} is not defined in expression=${expr}`);
		}
	}

	return new Date(Date.UTC(year, month, day));
}

function hasChanged(key, before, after) {
	if (before === undefined) return true;

	if (before[key] === undefined || (key in before && !deepEqual(before[key], after[key]))) {
		if (!(before[key] === undefined && after[key] === null)) {
			return true;
		}
	}
	return false;
}

function deepEqual(v1, v2) {
	return JSON.stringify(v1) === JSON.stringify(v2);
}

function toVal(mix) {
	var k,
		y,
		str = '';

	if (typeof mix === 'string' || typeof mix === 'number') {
		str += mix;
	} else if (typeof mix === 'object') {
		if (Array.isArray(mix)) {
			for (k = 0; k < mix.length; k++) {
				if (mix[k]) {
					if ((y = toVal(mix[k]))) {
						str && (str += ' ');
						str += y;
					}
				}
			}
		} else {
			for (k in mix) {
				if (mix[k]) {
					str && (str += ' ');
					str += k;
				}
			}
		}
	}

	return str;
}

function clsx() {
	var i = 0,
		tmp,
		x,
		str = '';
	while (i < arguments.length) {
		if ((tmp = arguments[i++])) {
			if ((x = toVal(tmp))) {
				str && (str += ' ');
				str += x;
			}
		}
	}
	return str;
}

export {
	setAttributes,
	createDomElement,
	addDomElement,
	clickOutside,
	isArray,
	isRequired,
	evaluate,
	dateFormatCorrect,
	getDateFromExpr,
	hasChanged,
	deepEqual,
	scanValue,
	clsx
};
