// Generated

{
	const astNodes = new WeakSet();
	const astHandler = {
		get: (target, key) => {
			if(Object.hasOwn(target.ast_memoized_merged_nodes, key)) return target.ast_memoized_merged_nodes[key];
			if(target.ast_node_names.has(key)) {
				let nodes = target.astnodes.filter(node => node.astname === key);
				const merged = new ASTNode(key, nodes.map(node => node.astvalues).flat(), nodes.map(node => node.text).join(""), nodes[0].start, nodes.at(-1).end);
				target.ast_memoized_merged_nodes[key] = merged;
				return merged;
			}
			if(Reflect.has(target, key)) return Reflect.get(target, key);
			return undefined; // Signals that no such property or node exists
		},
	};
	function astToString() {
		let ast = this;
		let stringsJoined = ast.reduce((arr, val) => typeof val === "string" && arr.length > 0 && typeof arr.at(-1) === "string" ? [...arr.slice(0, arr.length-1), arr.at(-1)+val] : [...arr, val], []);
		return ast.astname + " {\n" + stringsJoined.map(val => astNodes.has(val) ? val.toString().split("\n") : [val]).flat().map(line => "  " + line).join("\n") + "\n}";
	}
	function ASTNode(name, results, text, start, end) {
		let o = results.slice();
		o.astname = name;
		o.astvalues = results;
		o.astnodes = results.filter(val => astNodes.has(val));
		o.ast_memoized_merged_nodes = {};
		o.ast_node_names = new Set(o.astnodes.map(node => node.astname));
		o.text = text;
		o.emitted = results.map(val => astNodes.has(val) ? val.emitted : val).join(""); // .emitted is a string of all emitted text
		o.start = start;
		o.end = end;
		o.toString = astToString;
		let proxy = new Proxy(o, astHandler);
		astNodes.add(proxy);
		return proxy;
	}
	Object.defineProperty(ASTNode, Symbol.hasInstance, {
		value: (value) => {
			return astNodes.has(value);
		},
	});
	globalThis.ASTNode = ASTNode;
}


globalThis.parse = parse;
function parse(code, { start: startDefName = "main", filename: filename = null, custom_defs = null } = {}) {
	
	const defs = {};
	const visualNames = {};
	const memoized = {};

	// Used for error generation
	let last = {
		entered: { name: null, start: null },
		exited: { name: null, end: null },
	};
	let furthest = {
		entered: { name: null, start: null },
		exited: { name: null, end: null },
		pos: 0, // At the end of parsing, will be the furthest successfully parsed excluding exprs inside non-consuming exprs
	};
	function getFurthestBackup() { // For non-consuming exprs to be able to restore furthest
		return structuredClone(furthest);
	}

	function match(results, start, end) {
		if(end >= furthest.pos) {
			furthest.pos = end;
			furthest.entered = last.entered;
			furthest.exited = last.exited;
		}
		return { matched: true, results, start, end };
	}
	function fail() {
		return { matched: false };
	}
	
	const exprs = {};
	exprs.str = (s) => (start) => {
		return code.slice(start, start+s.length) === s ? match([], start, start+s.length) : fail();
	};
	exprs.eof = () => (start) => {
		return start === code.length ? match([], start, start) : fail();
	};
	exprs.def = (name) => (start) => {
		let prevEntered = last.entered;
		if(Object.hasOwn(visualNames, name)) last.entered = { name, start };
		
		if(!Object.hasOwn(memoized, name)) memoized[name] = new Map();
		if(!memoized[name].has(start)) {
			if(Object.hasOwn(defs, name)) memoized[name].set(start, defs[name](start));
			else if(Object.hasOwn(custom_defs, name)) memoized[name].set(start, custom_defs[name]({ defs, exprs, code, match, fail }, start));
			else throw new Error("Unknown definition: " + name);
		}
		let res = memoized[name].get(start);
		
		if(Object.hasOwn(visualNames, name)) last.entered = prevEntered;
		if(!res.matched) return fail();
		if(Object.hasOwn(visualNames, name)) last.exited = { name, end: res.end };
		return res;
	};
	exprs.join = (...funcs) => (start) => {
		let results = [];
		let curr = start;
		for(let func of funcs) {
			let res = func(curr);
			if(!res.matched) return fail();
			results = [...results, ...res.results];
			curr = res.end;
		}
		return match(results, start, curr);
	};
	exprs.choice = (...funcs) => (start) => {
		return funcs.reduce((res, func) => res.matched ? res : func(start), fail());
	};
	exprs.repeat = (func) => (start) => {
		let results = [];
		let curr = start;
		while(true) {
			let res = func(curr);
			if(!res.matched) return match(results, start, curr);
			results = [...results, ...res.results];
			curr = res.end;
		}
	};
	exprs.repeat_plus = (func) => (start) => {
		let res = func(start);
		if(!res.matched) return fail();
		let results = res.results;
		let curr = res.end;
		while(true) {
			let res = func(curr);
			if(!res.matched) return match(results, start, curr);
			results = [...results, ...res.results];
			curr = res.end;
		}
	};
	exprs.optional = (func) => (start) => {
		let res = func(start);
		return res.matched ? res : match([], start, start);
	};
	exprs.not = (func) => (start) => {
		const furthestBackup = getFurthestBackup();
		let res = func(start);
		furthest = furthestBackup;
		return res.matched ? fail() : match([], start, start);
	};
	exprs.and = (func) => (start) => {
		const furthestBackup = getFurthestBackup();
		let res = func(start);
		furthest = furthestBackup;
		return res.matched ? match([], start, start) : fail();
	};
	exprs.noemit = (func) => (start) => {
		let res = func(start);
		return res.matched ? match([], start, res.end) : fail();
	};
	exprs.noconsume = (func) => (start) => {
		const furthestBackup = getFurthestBackup();
		let res = func(start);
		furthest = furthestBackup;
		return res.matched ? match(res.results, start, start) : fail();
	};
	exprs.char_range = (start_char, end_char) => {
		if(start_char.charCodeAt(0) > end_char.charCodeAt(0)) throw new Error("Char range must not be reversed (ex: Z-A)");
		return (start) => {
			return start < code.length && code[start].charCodeAt(0) >= start_char.charCodeAt(0) && code[start].charCodeAt(0) <= end_char.charCodeAt(0) ? match([], start, start+1) : fail();
		};
	};
	exprs.emit_code = (str) => (start) => {
		return match([str], start, start);
	};
	exprs.emit_consumed = (func) => (start) => {
		let res = func(start);
		return res.matched ? match([code.slice(start, res.end)], start, res.end) : fail();
	};
	exprs.named = (name, func) => (start) => {
		let res = func(start);
		return res.matched ? match([new ASTNode(name, res.results, code.slice(start, res.end), start, res.end)], start, res.end) : fail();
	};


	function define(name, visualName, func) {
		if(Object.hasOwn(defs, name)) throw new Error("Duplicate definition: " + name);
		defs[name] = func;
		if(visualName !== null) visualNames[name] = visualName;
	}

	// Definitions
	define("_", null, exprs.repeat(exprs.choice(exprs.str(" "), exprs.str("\t"), exprs.str("\n"), exprs.def("comment"))));
	define("comment", "comment", exprs.join(exprs.str("#"), exprs.repeat(exprs.join(exprs.not(exprs.str("\n")), exprs.char_range("\x00", "\xFF"))), exprs.optional(exprs.str("\n"))));
	define("EMIT_ANY", null, exprs.choice(exprs.join(exprs.not(exprs.str("\"")), exprs.not(exprs.str("\'")), exprs.not(exprs.str("\\")), exprs.emit_consumed(exprs.char_range("\x20", "\x7e"))), exprs.join(exprs.str("\n"), exprs.emit_code("\\n")), exprs.join(exprs.emit_code("\\"), exprs.emit_consumed(exprs.char_range("\x00", "\xFF")))));
	define("HEX", null, exprs.choice(exprs.char_range("0", "9"), exprs.char_range("a", "f"), exprs.char_range("A", "F")));
	define("identifier", "identifier", exprs.join(exprs.choice(exprs.char_range("a", "z"), exprs.char_range("A", "Z"), exprs.str("_")), exprs.repeat(exprs.choice(exprs.char_range("a", "z"), exprs.char_range("A", "Z"), exprs.char_range("0", "9"), exprs.str("_")))));
	define("string", "string", exprs.join(exprs.emit_code("\""), exprs.choice(exprs.join(exprs.str("\""), exprs.repeat(exprs.join(exprs.not(exprs.str("\"")), exprs.not(exprs.str("\n")), exprs.def("char"))), exprs.str("\"")), exprs.join(exprs.str("\'"), exprs.repeat(exprs.join(exprs.not(exprs.str("\'")), exprs.not(exprs.str("\n")), exprs.def("char"))), exprs.str("\'"))), exprs.emit_code("\"")));
	define("char", null, exprs.choice(exprs.def("escape"), exprs.join(exprs.not(exprs.str("\\")), exprs.def("EMIT_ANY"))));
	define("escape", null, exprs.choice(exprs.join(exprs.str("\\"), exprs.def("escape_combos")), exprs.join(exprs.str("\\"), exprs.choice(exprs.str("x"), exprs.str("X")), exprs.emit_code("\\x"), exprs.emit_consumed(exprs.def("HEX")), exprs.emit_consumed(exprs.def("HEX")))));
	define("escape_combos", null, exprs.choice(exprs.join(exprs.str("n"), exprs.emit_code("\\n")), exprs.join(exprs.str("t"), exprs.emit_code("\\t")), exprs.join(exprs.str("r"), exprs.emit_code("\\r")), exprs.join(exprs.str("\""), exprs.emit_code("\\\"")), exprs.join(exprs.str("\'"), exprs.emit_code("\\\'")), exprs.join(exprs.str("\\"), exprs.emit_code("\\\\"))));
	define("main", null, exprs.join(exprs.def("PREPEND_CODE"), exprs.join(exprs.def("_"), exprs.repeat(exprs.join(exprs.def("statement"), exprs.def("_")))), exprs.def("APPEND_CODE")));
	define("statement", "definition", exprs.join(exprs.emit_code("\	define(\""), exprs.emit_consumed(exprs.def("identifier")), exprs.emit_code("\", "), exprs.choice(exprs.join(exprs.def("_"), exprs.str(":"), exprs.def("_"), exprs.def("string"), exprs.emit_code(", ")), exprs.emit_code("null, ")), exprs.def("_"), exprs.str("="), exprs.def("_"), exprs.def("expr"), exprs.emit_code(");\n")));
	define("expr", "expression", exprs.def("expr1"));
	define("expr1", null, exprs.choice(exprs.join(exprs.emit_code("exprs.choice("), exprs.def("expr2"), exprs.repeat_plus(exprs.join(exprs.def("_"), exprs.str("|"), exprs.def("_"), exprs.emit_code(", "), exprs.def("expr2"))), exprs.emit_code(")")), exprs.def("expr2")));
	define("expr2", null, exprs.choice(exprs.join(exprs.emit_code("exprs.join("), exprs.def("expr3"), exprs.repeat_plus(exprs.join(exprs.def("_"), exprs.emit_code(", "), exprs.def("expr3"))), exprs.emit_code(")")), exprs.def("expr3")));
	define("expr3", null, exprs.def("value"));
	define("value", null, exprs.choice(exprs.join(exprs.str("("), exprs.def("_"), exprs.def("expr"), exprs.def("_"), exprs.str(")")), exprs.join(exprs.emit_code("exprs.noemit("), exprs.join(exprs.str("!!"), exprs.def("_"), exprs.def("value")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.noconsume("), exprs.join(exprs.str("&&"), exprs.def("_"), exprs.def("value")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.not("), exprs.join(exprs.str("!"), exprs.def("_"), exprs.def("value")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.and("), exprs.join(exprs.str("&"), exprs.def("_"), exprs.def("value")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.emit_consumed("), exprs.join(exprs.str("%"), exprs.def("_"), exprs.def("value")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.str("), exprs.def("string"), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.repeat_plus("), exprs.join(exprs.str("{"), exprs.def("_"), exprs.def("expr"), exprs.def("_"), exprs.str("}+")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.repeat("), exprs.join(exprs.str("{"), exprs.def("_"), exprs.def("expr"), exprs.def("_"), exprs.str("}")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.optional("), exprs.join(exprs.str("["), exprs.def("_"), exprs.def("expr"), exprs.def("_"), exprs.str("]")), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.emit_code(\""), exprs.join(exprs.str("`"), exprs.repeat(exprs.join(exprs.not(exprs.str("`")), exprs.def("EMIT_ANY"))), exprs.str("`")), exprs.emit_code("\")")), exprs.join(exprs.emit_code("exprs.char_range(\""), exprs.def("char"), exprs.emit_code("\", \""), exprs.str("-"), exprs.def("char"), exprs.emit_code("\")")), exprs.join(exprs.emit_code("exprs.named(\""), exprs.emit_consumed(exprs.def("identifier")), exprs.emit_code("\", "), exprs.str("("), exprs.def("_"), exprs.def("expr"), exprs.def("_"), exprs.str(")"), exprs.emit_code(")")), exprs.join(exprs.emit_code("exprs.def(\""), exprs.join(exprs.emit_consumed(exprs.def("identifier")), exprs.not(exprs.choice(exprs.join(exprs.def("_"), exprs.str("=")), exprs.join(exprs.def("_"), exprs.str(":"))))), exprs.emit_code("\")"))));
	define("PREPEND_CODE", null, exprs.emit_code("// Generated\n\n{\n\	const astNodes = new WeakSet();\n\	const astHandler = {\n\	\	get: (target, key) => {\n\	\	\	if(Object.hasOwn(target.ast_memoized_merged_nodes, key)) return target.ast_memoized_merged_nodes[key];\n\	\	\	if(target.ast_node_names.has(key)) {\n\	\	\	\	let nodes = target.astnodes.filter(node => node.astname === key);\n\	\	\	\	const merged = new ASTNode(key, nodes.map(node => node.astvalues).flat(), nodes.map(node => node.text).join(\"\"), nodes[0].start, nodes.at(-1).end);\n\	\	\	\	target.ast_memoized_merged_nodes[key] = merged;\n\	\	\	\	return merged;\n\	\	\	}\n\	\	\	if(Reflect.has(target, key)) return Reflect.get(target, key);\n\	\	\	return undefined; // Signals that no such property or node exists\n\	\	},\n\	};\n\	function astToString() {\n\	\	let ast = this;\n\	\	let stringsJoined = ast.reduce((arr, val) => typeof val === \"string\" && arr.length > 0 && typeof arr.at(-1) === \"string\" ? [...arr.slice(0, arr.length-1), arr.at(-1)+val] : [...arr, val], []);\n\	\	return ast.astname + \" {\\n\" + stringsJoined.map(val => astNodes.has(val) ? val.toString().split(\"\\n\") : [val]).flat().map(line => \"  \" + line).join(\"\\n\") + \"\\n}\";\n\	}\n\	function ASTNode(name, results, text, start, end) {\n\	\	let o = results.slice();\n\	\	o.astname = name;\n\	\	o.astvalues = results;\n\	\	o.astnodes = results.filter(val => astNodes.has(val));\n\	\	o.ast_memoized_merged_nodes = {};\n\	\	o.ast_node_names = new Set(o.astnodes.map(node => node.astname));\n\	\	o.text = text;\n\	\	o.emitted = results.map(val => astNodes.has(val) ? val.emitted : val).join(\"\"); // .emitted is a string of all emitted text\n\	\	o.start = start;\n\	\	o.end = end;\n\	\	o.toString = astToString;\n\	\	let proxy = new Proxy(o, astHandler);\n\	\	astNodes.add(proxy);\n\	\	return proxy;\n\	}\n\	Object.defineProperty(ASTNode, Symbol.hasInstance, {\n\	\	value: (value) => {\n\	\	\	return astNodes.has(value);\n\	\	},\n\	});\n\	globalThis.ASTNode = ASTNode;\n}\n\n\nglobalThis.parse = parse;\nfunction parse(code, { start: startDefName = \"main\", filename: filename = null, custom_defs = null } = {}) {\n\	\n\	const defs = {};\n\	const visualNames = {};\n\	const memoized = {};\n\n\	// Used for error generation\n\	let last = {\n\	\	entered: { name: null, start: null },\n\	\	exited: { name: null, end: null },\n\	};\n\	let furthest = {\n\	\	entered: { name: null, start: null },\n\	\	exited: { name: null, end: null },\n\	\	pos: 0, // At the end of parsing, will be the furthest successfully parsed excluding exprs inside non-consuming exprs\n\	};\n\	function getFurthestBackup() { // For non-consuming exprs to be able to restore furthest\n\	\	return structuredClone(furthest);\n\	}\n\n\	function match(results, start, end) {\n\	\	if(end >= furthest.pos) {\n\	\	\	furthest.pos = end;\n\	\	\	furthest.entered = last.entered;\n\	\	\	furthest.exited = last.exited;\n\	\	}\n\	\	return { matched: true, results, start, end };\n\	}\n\	function fail() {\n\	\	return { matched: false };\n\	}\n\	\n\	const exprs = {};\n\	exprs.str = (s) => (start) => {\n\	\	return code.slice(start, start+s.length) === s ? match([], start, start+s.length) : fail();\n\	};\n\	exprs.eof = () => (start) => {\n\	\	return start === code.length ? match([], start, start) : fail();\n\	};\n\	exprs.def = (name) => (start) => {\n\	\	let prevEntered = last.entered;\n\	\	if(Object.hasOwn(visualNames, name)) last.entered = { name, start };\n\	\	\n\	\	if(!Object.hasOwn(memoized, name)) memoized[name] = new Map();\n\	\	if(!memoized[name].has(start)) {\n\	\	\	if(Object.hasOwn(defs, name)) memoized[name].set(start, defs[name](start));\n\	\	\	else if(Object.hasOwn(custom_defs, name)) memoized[name].set(start, custom_defs[name]({ defs, exprs, code, match, fail }, start));\n\	\	\	else throw new Error(\"Unknown definition: \" + name);\n\	\	}\n\	\	let res = memoized[name].get(start);\n\	\	\n\	\	if(Object.hasOwn(visualNames, name)) last.entered = prevEntered;\n\	\	if(!res.matched) return fail();\n\	\	if(Object.hasOwn(visualNames, name)) last.exited = { name, end: res.end };\n\	\	return res;\n\	};\n\	exprs.join = (...funcs) => (start) => {\n\	\	let results = [];\n\	\	let curr = start;\n\	\	for(let func of funcs) {\n\	\	\	let res = func(curr);\n\	\	\	if(!res.matched) return fail();\n\	\	\	results = [...results, ...res.results];\n\	\	\	curr = res.end;\n\	\	}\n\	\	return match(results, start, curr);\n\	};\n\	exprs.choice = (...funcs) => (start) => {\n\	\	return funcs.reduce((res, func) => res.matched ? res : func(start), fail());\n\	};\n\	exprs.repeat = (func) => (start) => {\n\	\	let results = [];\n\	\	let curr = start;\n\	\	while(true) {\n\	\	\	let res = func(curr);\n\	\	\	if(!res.matched) return match(results, start, curr);\n\	\	\	results = [...results, ...res.results];\n\	\	\	curr = res.end;\n\	\	}\n\	};\n\	exprs.repeat_plus = (func) => (start) => {\n\	\	let res = func(start);\n\	\	if(!res.matched) return fail();\n\	\	let results = res.results;\n\	\	let curr = res.end;\n\	\	while(true) {\n\	\	\	let res = func(curr);\n\	\	\	if(!res.matched) return match(results, start, curr);\n\	\	\	results = [...results, ...res.results];\n\	\	\	curr = res.end;\n\	\	}\n\	};\n\	exprs.optional = (func) => (start) => {\n\	\	let res = func(start);\n\	\	return res.matched ? res : match([], start, start);\n\	};\n\	exprs.not = (func) => (start) => {\n\	\	const furthestBackup = getFurthestBackup();\n\	\	let res = func(start);\n\	\	furthest = furthestBackup;\n\	\	return res.matched ? fail() : match([], start, start);\n\	};\n\	exprs.and = (func) => (start) => {\n\	\	const furthestBackup = getFurthestBackup();\n\	\	let res = func(start);\n\	\	furthest = furthestBackup;\n\	\	return res.matched ? match([], start, start) : fail();\n\	};\n\	exprs.noemit = (func) => (start) => {\n\	\	let res = func(start);\n\	\	return res.matched ? match([], start, res.end) : fail();\n\	};\n\	exprs.noconsume = (func) => (start) => {\n\	\	const furthestBackup = getFurthestBackup();\n\	\	let res = func(start);\n\	\	furthest = furthestBackup;\n\	\	return res.matched ? match(res.results, start, start) : fail();\n\	};\n\	exprs.char_range = (start_char, end_char) => {\n\	\	if(start_char.charCodeAt(0) > end_char.charCodeAt(0)) throw new Error(\"Char range must not be reversed (ex: Z-A)\");\n\	\	return (start) => {\n\	\	\	return start < code.length && code[start].charCodeAt(0) >= start_char.charCodeAt(0) && code[start].charCodeAt(0) <= end_char.charCodeAt(0) ? match([], start, start+1) : fail();\n\	\	};\n\	};\n\	exprs.emit_code = (str) => (start) => {\n\	\	return match([str], start, start);\n\	};\n\	exprs.emit_consumed = (func) => (start) => {\n\	\	let res = func(start);\n\	\	return res.matched ? match([code.slice(start, res.end)], start, res.end) : fail();\n\	};\n\	exprs.named = (name, func) => (start) => {\n\	\	let res = func(start);\n\	\	return res.matched ? match([new ASTNode(name, res.results, code.slice(start, res.end), start, res.end)], start, res.end) : fail();\n\	};\n\n\n\	function define(name, visualName, func) {\n\	\	if(Object.hasOwn(defs, name)) throw new Error(\"Duplicate definition: \" + name);\n\	\	defs[name] = func;\n\	\	if(visualName !== null) visualNames[name] = visualName;\n\	}\n\n\	// Definitions\n"));
	define("APPEND_CODE", null, exprs.emit_code("\n\	const fmt_rowcol = (pos) => (filename !== null ? filename+\":\" : \"\") + code.slice(0, pos).split(\"\\n\").length + \":\" + (code.slice(0, pos).split(\"\\n\").at(-1).length+1);\n\n\	const result = exprs.join(exprs.def(startDefName), exprs.eof())(0);\n\	if(result.matched) {\n\	\	return new ASTNode(startDefName, result.results, code, 0, code.length);\n\	} else {\n\	\	if(furthest.entered.name !== null && furthest.pos > furthest.entered.start && furthest.exited.name !== null && furthest.exited.end === furthest.pos) throw new Error(fmt_rowcol(furthest.pos) + \" Invalid syntax after \" + visualNames[furthest.exited.name] + \" in \" + visualNames[furthest.entered.name]);\n\	\	if(furthest.entered.name !== null && furthest.pos > furthest.entered.start) throw new Error(fmt_rowcol(furthest.pos) + \" Invalid syntax in \" + visualNames[furthest.entered.name]);\n\	\	if(furthest.exited.name !== null) throw new Error(fmt_rowcol(furthest.pos) + \" Invalid syntax after \" + visualNames[furthest.exited.name]);\n\	\	throw new Error(fmt_rowcol(furthest.pos) + \" Invalid syntax\");\n\	}\n}"));

	const fmt_rowcol = (pos) => (filename !== null ? filename+":" : "") + code.slice(0, pos).split("\n").length + ":" + (code.slice(0, pos).split("\n").at(-1).length+1);

	const result = exprs.join(exprs.def(startDefName), exprs.eof())(0);
	if(result.matched) {
		return new ASTNode(startDefName, result.results, code, 0, code.length);
	} else {
		if(furthest.entered.name !== null && furthest.pos > furthest.entered.start && furthest.exited.name !== null && furthest.exited.end === furthest.pos) throw new Error(fmt_rowcol(furthest.pos) + " Invalid syntax after " + visualNames[furthest.exited.name] + " in " + visualNames[furthest.entered.name]);
		if(furthest.entered.name !== null && furthest.pos > furthest.entered.start) throw new Error(fmt_rowcol(furthest.pos) + " Invalid syntax in " + visualNames[furthest.entered.name]);
		if(furthest.exited.name !== null) throw new Error(fmt_rowcol(furthest.pos) + " Invalid syntax after " + visualNames[furthest.exited.name]);
		throw new Error(fmt_rowcol(furthest.pos) + " Invalid syntax");
	}
}