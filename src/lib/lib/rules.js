import { dateFormatCorrect, getDateFromExpr } from './helpers';

export function required(val) {
	if (!val) return false;
	return typeof val === 'string' ? !/^\s*$/.test(val) : true;
}

export function equal(val, args) {
	if (!val) return true;
	return val === args[0];
}

export function length(val, args) {
	if (!val) return true;
	return val.length === parseInt(args[0]);
}
export function between(val, args) {
	if (!val) return true;
	return min(val, [args[0]]) && max(val, [args[1]]);
}

export function email(val) {
	if (!val) return true;
	const regex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return val && regex.test(val);
}

export function max(val, args) {
	if (!val) return true;
	const value = isNaN(val) ? val.length : parseFloat(val);
	return isNaN(value) ? true : value <= parseFloat(args[0]);
}

export function min(val, args) {
	if (!val) return true;
	const value = isNaN(val) ? val.length : parseFloat(val);
	return value >= parseFloat(args[0]);
}

export function url(val) {
	if (!val) return true;
	return /(https?|ftp|git|svn):\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/i.test(
		val
	);
}

export function date(val, args) {
	if (!val) return true;
	if (dateFormatCorrect(val)) {
		const [filter, moment] = args;

		if (filter === undefined) return true;

		const [start, end] = filter
			.replaceAll(' ', '')
			.replaceAll('<=', '')
			.replaceAll('<', '')
			.split('date');

		let startDate = getDateFromExpr(start, moment);
		let endDate = getDateFromExpr(end, moment);

		let result = true;
		const [yyyy, mm, dd] = val.split('-').map((p) => parseInt(p));
		const d = new Date(Date.UTC(yyyy, mm - 1, dd));

		if (startDate) {
			result = d >= startDate;
		}
		if (endDate) {
			result = result && d <= endDate;
		}

		return result;
	}

	return false;
}

export function confirm(val, args, values) {
	if (!val) return true;
	if (args[0] in values) {
		return val === values[args[0]];
	} else {
		return false;
	}
}
