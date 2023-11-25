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
	define("comment", "comment", exprs.choice(exprs.join(exprs.str("//"), exprs.repeat(exprs.join(exprs.not(exprs.str("\n")), exprs.char_range("\x00", "\xFF"))), exprs.optional(exprs.str("\n"))), exprs.def("multiline_comment")));
	define("multiline_comment", null, exprs.join(exprs.str("/*"), exprs.repeat(exprs.choice(exprs.def("multiline_comment"), exprs.join(exprs.not(exprs.str("*/")), exprs.char_range("\x00", "\xFF")))), exprs.str("*/")));
	define("EMIT_ANY", null, exprs.choice(exprs.join(exprs.not(exprs.str("\"")), exprs.not(exprs.str("\'")), exprs.not(exprs.str("\\")), exprs.emit_consumed(exprs.char_range("\x20", "\x7e"))), exprs.join(exprs.str("\n"), exprs.emit_code("\\n")), exprs.join(exprs.emit_code("\\"), exprs.emit_consumed(exprs.char_range("\x00", "\xFF")))));
	define("HEX", null, exprs.choice(exprs.char_range("0", "9"), exprs.char_range("a", "f"), exprs.char_range("A", "F")));
	define("identifier", "identifier", exprs.join(exprs.choice(exprs.char_range("a", "z"), exprs.char_range("A", "Z"), exprs.str("_")), exprs.repeat(exprs.choice(exprs.char_range("a", "z"), exprs.char_range("A", "Z"), exprs.char_range("0", "9"), exprs.str("_")))));
	define("string", "string", exprs.join(exprs.emit_code("\""), exprs.choice(exprs.join(exprs.str("\""), exprs.repeat(exprs.join(exprs.not(exprs.str("\"")), exprs.not(exprs.str("\n")), exprs.def("char"))), exprs.str("\"")), exprs.join(exprs.str("\'"), exprs.repeat(exprs.join(exprs.not(exprs.str("\'")), exprs.not(exprs.str("\n")), exprs.def("char"))), exprs.str("\'"))), exprs.emit_code("\"")));
	define("char", null, exprs.choice(exprs.def("escape"), exprs.join(exprs.not(exprs.str("\\")), exprs.def("EMIT_ANY"))));
	define("escape", null, exprs.choice(exprs.join(exprs.str("\\"), exprs.def("escape_combos")), exprs.join(exprs.str("\\"), exprs.choice(exprs.str("x"), exprs.str("X")), exprs.emit_code("\\x"), exprs.emit_consumed(exprs.def("HEX")), exprs.emit_consumed(exprs.def("HEX")))));
	define("escape_combos", null, exprs.choice(exprs.join(exprs.str("n"), exprs.emit_code("\\n")), exprs.join(exprs.str("t"), exprs.emit_code("\\t")), exprs.join(exprs.str("r"), exprs.emit_code("\\r")), exprs.join(exprs.str("\""), exprs.emit_code("\\\"")), exprs.join(exprs.str("\'"), exprs.emit_code("\\\'")), exprs.join(exprs.str("\\"), exprs.emit_code("\\\\"))));
	define("main", null, exprs.join(exprs.def("_"), exprs.repeat(exprs.choice(exprs.join(exprs.def("function"), exprs.def("_")), exprs.join(exprs.def("statement"), exprs.def("_"))))));
	define("function", null, exprs.not(exprs.str("")));
	define("statement", null, exprs.not(exprs.str("")));

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