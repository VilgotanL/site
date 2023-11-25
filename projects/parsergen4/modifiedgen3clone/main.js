let interpreter = createInterpreter({
    title: "modified gen3 clone for pgen4",
    theme: "light",
    titlebar: [
        {p: "that i made to avoid making a parser for the pgen4 grammar by hand initially"},
    ],
    options: [
        {debug: "checkbox", text: "Debug: ", value: true},
    ],
    buttons: [
        {gen: "Generate"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        append(code);
    }
});



interpreter.onClick("gen", async function() {

    let ast = parse_peg(interpreter.code);
    if(ast.error) interpreter.err(ast.error);
    console.log("AST", ast);
    let grammar = new Grammar(ast);

    interpreter.output(gen_js(grammar));
});


const gen_js_start = (String.raw`
// Generated
const astNodesWeakSet = new WeakSet();
Object.defineProperty(ASTNode, Symbol.hasInstance, {
    value: (value) => {
        return astNodesWeakSet.has(value);
    },
});
const astNodeHandler = {
    get: (target, key) => {
        if(Reflect.has(target, key)) return Reflect.get(target, key);
        if(Object.hasOwn(target._memoized_merged_nodes, key)) return target._memoized_merged_nodes[key];
        let foundNodes = target.nodes.filter(n => n.name === key);
        if(foundNodes.length > 0) {
            const merged = ASTNode(key, foundNodes.map(n => n.values).flat(), foundNodes.map(n => n.text).join(""), foundNodes[0].start, foundNodes.at(-1).end);
            target._memoized_merged_nodes[key] = merged;
            return merged;
        }
        return undefined; // TODO should this error instead?
    },
};
function astToString() {
    if(this.nodes.some(n => n instanceof ASTNode)) {
        return this.name + '(' + this.nodes.filter(n => n instanceof ASTNode).map(v => v.toString()).join(", ") + ')';
    } else {
        return this.name + '("' + this.text + '")';
    }
}
function ASTNode(name, values, text, start, end) {
    let o = values.slice();
    o.name = name;
    o.values = values;
    o.nodes = values.filter(v => v instanceof ASTNode);
    o._memoized_merged_nodes = {};
    o.text = text;
    o.emitted = values.map(v => v instanceof ASTNode ? v.emitted : v).join(""); // .emitted is a string of all emitted text
    o.start = start;
    o.end = end;
    o.toString = astToString;
    let proxy = new Proxy(o, astNodeHandler);
    astNodesWeakSet.add(proxy);
    return proxy;
}


globalThis.parse = parse;
function parse(code) {
    const memoTable = new Map();
    let greatestSuccessIndex = 0;
    
    function Ctx(i) {
        this.i = i;
        this.line = code.slice(0, i).split("\n").length;
        this.column = code.slice(0, i).split("\n").at(-1).length+1;
    }
    function Res(result, consumed, start) {
        this.result = result; //array of values or false
        this.consumed = consumed;
        this.start = start;
        this.end = start + consumed;
    }
    function str(s) {
        return (start) => {
            if(code.slice(start).startsWith(s)) {
                if(start + s.length > greatestSuccessIndex) greatestSuccessIndex = start + s.length;
                return new Res([], s.length, start);
            }
            return new Res(false, 0, start);
        };
    }
    function choice(...funcs) {
        return (start) => {
            for(let i=0; i<funcs.length; i++) {
                let res = funcs[i](start);
                if(res.result !== false) return res;
            }
            return new Res(false, 0, start);
        };
    }
    function join(...funcs) {
        return (start) => {
            let consumed = 0;
            let result = [];
            for(let i=0; i<funcs.length; i++) {
                let res = funcs[i](start + consumed);
                if(res.result === false) return new Res(false, 0, start);
                result = [...result, ...res.result];
                consumed += res.consumed;
            }
            return new Res(result, consumed, start);
        };
    }
    function not(f) {
        return (start) => {
            if(f(start).result === false) return new Res([], 0, start);
            return new Res(false, 0, start);
        };
    }
    function and(f) {
        return (start) => {
            if(f(start).result !== false) return new Res([], 0, start);
            return new Res(false, 0, start);
        };
    }
    function optional(f) {
        return (start) => {
            let res = f(start);
            if(res.result !== false) return res;
            return new Res([], 0, start);
        };
    }
    function repeat(f) {
        return (start) => {
            let consumed = 0;
            let result = [];
            while(true) {
                let res = f(start + consumed);
                if(res.result === false) return new Res(result, consumed, start);
                result = [...result, ...res.result];
                consumed += res.consumed;
            }
        };
    }
    function repeat_plus(f) {
        return (start) => {
            let res1 = f(start);
            if(res1.result === false) return new Res(false, 0, start);
            let consumed = res1.consumed;
            let result = res1.result;
            while(true) {
                let res = f(start + consumed);
                if(res.result === false) return new Res(result, consumed, start);
                result = [...result, ...res.result];
                consumed += res.consumed;
            }
        };
    }
    function char_range(chars) {
        return (start) => {
            let index = chars.indexOf(code.slice(start, start+1));
            if(start < code.length && index >= 0) return new Res([], 1, start);
            return new Res(false, 0, start);
        };
    }
    function out_code(str) {
        return (start) => {
            return new Res([str], 0, start);
        };
    }
    function noconsume(f) {
        return (start) => {
            let res = f(start);
            return new Res(res.result, 0, start);
        };
    }
    function noemit(f) {
        return (start) => {
            let res = f(start);
            return new Res(res.result === false ? false : [], res.consumed, start);
        };
    }
    function emit_source(f) {
        return (start) => {
            let res = f(start);
            return res.result === false ? new Res(false, 0, start) : new Res([code.slice(start, start+res.consumed)], res.consumed, start);
        };
    }
    function named(name, f) {
        return (start) => {
            let res = f(start);
            if(!res.result) return new Res(false, 0, start);
            let text = code.slice(start, start+res.consumed);
            return new Res([new ASTNode(name, res.result, text, new Ctx(start), new Ctx(start + res.consumed))], res.consumed, start);
        };
    }
    
`).slice(1);

const gen_js_end = (String.raw`
    
    let res = parse_main(0);
    if(res.result === false || res.consumed !== code.length) {
        let at = new Ctx(greatestSuccessIndex);
        throw new Error("Invalid syntax at "+at.line+":"+at.column);
    } else {
        return new ASTNode("main", res.result, code, new Ctx(0), new Ctx(code.length));
    }
}
`).slice(1);

function gen_js(grammar) {
    let out = gen_js_start;

    for(const [key, value] of grammar.defs) {
        out += `    function parse_${key}(start) {` + "\n";
        out += `        if(memoTable.has("${key} "+start)) return memoTable.get("${key} "+start);` + "\n";
        out += `        memoTable.set("${key} "+start, ${traverse(value.expr)}(start));` + "\n";
        out += `        return memoTable.get("${key} "+start);` + "\n";
        out += `    }` + "\n";

        function traverse(expr) {
            if(expr instanceof Str) return `str(${str_repr(expr.string)})`;
            else if(expr instanceof Choice) return `choice(${expr.items.map(v => traverse(v)).join(", ")})`;
            else if(expr instanceof Join) return `join(${expr.items.map(v => traverse(v)).join(", ")})`;
            else if(expr instanceof Not) return `not(${traverse(expr.expr)})`;
            else if(expr instanceof And) return `and(${traverse(expr.expr)})`;
            else if(expr instanceof Optional) return `optional(${traverse(expr.expr)})`;
            else if(expr instanceof RepeatPlus) return `repeat_plus(${traverse(expr.expr)})`;
            else if(expr instanceof Repeat) return `repeat(${traverse(expr.expr)})`;
            else if(expr instanceof CharRange) return `char_range(${str_repr(expr.chars)})`;
            else if(expr instanceof Token) return `parse_${expr.name}`;
            else if(expr instanceof OutCode) return `out_code(${str_repr(expr.string)})`;
            else if(expr instanceof NoConsume) return `noconsume(${traverse(expr.expr)})`;
            else if(expr instanceof NoEmit) return `noemit(${traverse(expr.expr)})`;
            else if(expr instanceof EmitSource) return `emit_source(${traverse(expr.expr)})`;
            else if(expr instanceof Named) return `named(${str_repr(expr.name)}, ${traverse(expr.expr)})`;
            else throw Error("Unknown grammar expr type");
        }
    }

    out += gen_js_end;
    return out;
}


function str_repr(str) {
    return `"${str.split("").map(char => "\\x" + char.charCodeAt(0).toString(16).padStart(2, "0")).join("")}"`;
}


function Grammar(node) {
    this.defs = new Map();
    node.all("Statement").forEach(node => {
        let def = new Def(node);
        this.defs.set(def.name, def);
    });
}
function Def(node) {
    this.name = node.one("name").text;
    this.expr = peg_expr(node.one("expr"));
}
function peg_expr(node) {
    if(node.has("Choice")) return new Choice(...node.one("Choice").all("expr").map(node => peg_expr(node)));
    if(node.has("Join")) return new Join(...node.one("Join").all("expr").map(node => peg_expr(node)));
    if(node.has("Not")) return new Not(peg_expr(node.one("Not").one("expr")));
    if(node.has("And")) return new And(peg_expr(node.one("And").one("expr")));
    if(node.has("String")) return new Str(node.one("String").all("char").map(node => peg_char(node)).join(""));
    if(node.has("RepeatPlus")) return new RepeatPlus(peg_expr(node.one("RepeatPlus").one("expr")));
    if(node.has("Repeat")) return new Repeat(peg_expr(node.one("Repeat").one("expr")));
    if(node.has("Optional")) return new Optional(peg_expr(node.one("Optional").one("expr")));
    if(node.has("Range")) return new CharRange(peg_range(node.one("Range")));
    if(node.has("Code")) return new OutCode(node.one("Code").all("char").map(char => char.text).join(""));
    if(node.has("Token")) return new Token(node.one("Token").one("name").text);
    if(node.has("NoConsume")) return new NoConsume(peg_expr(node.one("NoConsume").one("expr")));
    if(node.has("NoEmit")) return new NoEmit(peg_expr(node.one("NoEmit").one("expr")));
    if(node.has("EmitSource")) return new EmitSource(peg_expr(node.one("EmitSource").one("expr")));
    if(node.has("Named")) return new Named(node.one("Named").one("name").text, peg_expr(node.one("Named").one("expr")));
}
function peg_char(node) {
    if(node.has("Char")) return node.text;
    if(node.has("HexEscape")) return String.fromCharCode(Number(`0x${node.one("HexEscape").all("hex")[0].text}${node.one("HexEscape").all("hex")[1].text}`));
    if(node.has("Escape")) {
        const map = { n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"' };
        const char = node.one("Escape").one("esc").text;
        if(!map[char]) throw new Error("shouldnt happen");
        return map[char];
    }
    throw new Error("unknown char type");
}
function peg_range(node) {
    let [a, b] = [peg_char(node.one("from")).charCodeAt(0), peg_char(node.one("to")).charCodeAt(0)];
    if(a >= b) interpreter.err(`${node.start.line}:${node.start.column} Char range cannot be reverse or single-character`);
    return Array(b - a + 1).fill(0).map((_, i) => String.fromCharCode(a + i)).join("");
}
function Str(string) {
    this.string = string;
}
function Choice(...items) {
    this.items = items;
}
function Join(...items) {
    this.items = items;
}
function Not(expr) {
    this.expr = expr;
}
function And(expr) {
    this.expr = expr;
}
function Optional(expr) {
    this.expr = expr;
}
function RepeatPlus(expr) {
    this.expr = expr;
}
function Repeat(expr) {
    this.expr = expr;
}
function CharRange(chars) {
    this.chars = chars;
}
function Token(name) {
    this.name = name;
}
function OutCode(string) {
    this.string = string;
}
function NoConsume(expr) {
    this.expr = expr;
}
function NoEmit(expr) {
    this.expr = expr;
}
function EmitSource(expr) {
    this.expr = expr;
}
function Named(name, expr) {
    this.name = name;
    this.expr = expr;
}
