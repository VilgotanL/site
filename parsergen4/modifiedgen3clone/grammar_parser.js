class PEGNode {
    constructor(name, nodes, text, start, end) {
        this._name = name;
        this._nodes = nodes;
        this._text = text;
        this._start = start; //ctx
        this._end = end; //ctx
    }
    get name() { return this._name; }
    get nodes() { return [...this._nodes]; }
    get text() { return this._text; }
    get start() { return this._start; }
    get end() { return this._end; }
    
    one(name) {
        let found = this._nodes.filter(n => typeof n !== "string" && n.name === name);
        if(found.length !== 1) throw new Error("Expected one node of name '" + name + "'");
        return found[0];        
    }
    all(name) {
        return this._nodes.filter(n => typeof n !== "string" && n.name === name);
    }
    has(name) {
        return this._nodes.some(n => typeof n !== "string" && n.name === name);
    }
    toString() {
        if(this.nodes.find(n => typeof n !== "string")) {
            return this.name + '(' + this.nodes.filter(n => typeof n !== "string").map(v => v.toString()).join(", ") + ')';
        } else {
            return this.name + '("' + this.text + '")';
        }
    }
}

function parse_peg(code) {
    const memoTable = new Map();
    let greatestSuccessIndex = 0;
    
    function Ctx(i) {
        this.i = i;
        this.line = code.slice(0, i).split("\n").length;
        this.column = code.slice(0, i).split("\n").at(-1).length+1;
    }
    function Res(result, consumed, start) {
        this.result = result; //array
        this.consumed = consumed;
        this.start = start;
        this.end = start + consumed;
    }
    function str(s) {
        return (start) => {
            if(code.slice(start).startsWith(s)) {
                if(start + s.length > greatestSuccessIndex) greatestSuccessIndex = start + s.length;
                return new Res([s], s.length, start);
            }
            return new Res(false, 0, start);
        };
    }
    function choice(...funcs) {
        return (start) => {
            for(let i=0; i<funcs.length; i++) {
                let res = funcs[i](start);
                if(res.result) return res;
            }
            return new Res(false, 0, start);
        };
    }
    function join(...funcs) {
        return (start) => {
            let consumed = 0;
            let nodes = [];
            for(let i=0; i<funcs.length; i++) {
                let res = funcs[i](start + consumed);
                if(!res.result) return new Res(false, 0, start);
                nodes = [...nodes, ...res.result];
                consumed += res.consumed;
            }
            return new Res(nodes, consumed, start);
        };
    }
    function not(f) {
        return (start) => {
            if(!f(start).result) return new Res([], 0, start);
            return new Res(false, 0, start);
        };
    }
    function and(f) {
        return (start) => {
            if(f(start).result) return new Res([], 0, start);
            return new Res(false, 0, start);
        };
    }
    function optional(f) {
        return (start) => {
            let res = f(start);
            if(res.result) return res;
            return new Res([], 0, start);
        };
    }
    function repeat(f) {
        return (start) => {
            let consumed = 0;
            let nodes = [];
            while(true) {
                let res = f(start + consumed);
                if(!res.result) return new Res(nodes, consumed, start);
                nodes = [...nodes, ...res.result];
                consumed += res.consumed;
            }
        };
    }
    function repeat_plus(f) {
        return (start) => {
            let res1 = f(start);
            if(!res1.result) return new Res(false, 0, start);
            let consumed = res1.consumed;
            let nodes = res1.result;
            while(true) {
                let res = f(start + consumed);
                if(!res.result) return new Res(nodes, consumed, start);
                nodes = [...nodes, ...res.result];
                consumed += res.consumed;
            }
        };
    }
    function char_range(chars) {
        return (start) => {
            let index = chars.indexOf(code.slice(start, start+1));
            if(start < code.length && index >= 0) return new Res([chars[index]], 1, start);
            return new Res(false, 0, start);
        };
    }
    function name(str, f) {
        return (start) => {
            let res = f(start);
            if(!res.result) return new Res(false, 0, start);
            let text = res.result.map(v => typeof v === "string" ? v : v.text).join("");
            return new Res([new PEGNode(str, res.result, text, new Ctx(start), new Ctx(start + res.consumed))], res.consumed, start);
        };
    }
    
    function parse__(start) {
        if(memoTable.has("_ "+start)) return memoTable.get("_ "+start);
        memoTable.set("_ "+start, repeat(choice(str("\x20"), str("\x09"), str("\x0a"), parse_comment))(start));
        return memoTable.get("_ "+start);
    }
    function parse_comment(start) {
        if(memoTable.has("comment "+start)) return memoTable.get("comment "+start);
        memoTable.set("comment "+start, join(str("\x23"), repeat(join(not(str("\x0a")), parse_ANY)), optional(str("\x0a")))(start));
        return memoTable.get("comment "+start);
    }
    function parse_ANY(start) {
        if(memoTable.has("ANY "+start)) return memoTable.get("ANY "+start);
        memoTable.set("ANY "+start, char_range("\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")(start));
        return memoTable.get("ANY "+start);
    }
    function parse_HEX(start) {
        if(memoTable.has("HEX "+start)) return memoTable.get("HEX "+start);
        memoTable.set("HEX "+start, choice(char_range("\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39"), char_range("\x61\x62\x63\x64\x65\x66"), char_range("\x41\x42\x43\x44\x45\x46"))(start));
        return memoTable.get("HEX "+start);
    }
    function parse_identifier(start) {
        if(memoTable.has("identifier "+start)) return memoTable.get("identifier "+start);
        memoTable.set("identifier "+start, name("\x49\x64\x65\x6e\x74\x69\x66\x69\x65\x72", join(choice(char_range("\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a"), char_range("\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a"), str("\x5f")), repeat(choice(char_range("\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a"), char_range("\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a"), char_range("\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39"), str("\x5f")))))(start));
        return memoTable.get("identifier "+start);
    }
    function parse_string(start) {
        if(memoTable.has("string "+start)) return memoTable.get("string "+start);
        memoTable.set("string "+start, choice(join(str("\x22"), repeat(join(not(str("\x22")), not(str("\x0a")), name("\x63\x68\x61\x72", parse_char))), str("\x22")), join(str("\x27"), repeat(join(not(str("\x27")), not(str("\x0a")), name("\x63\x68\x61\x72", parse_char))), str("\x27")))(start));
        return memoTable.get("string "+start);
    }
    function parse_char(start) {
        if(memoTable.has("char "+start)) return memoTable.get("char "+start);
        memoTable.set("char "+start, choice(parse_escape, name("\x43\x68\x61\x72", join(not(str("\x5c")), parse_ANY)))(start));
        return memoTable.get("char "+start);
    }
    function parse_escape(start) {
        if(memoTable.has("escape "+start)) return memoTable.get("escape "+start);
        memoTable.set("escape "+start, choice(name("\x45\x73\x63\x61\x70\x65", join(str("\x5c"), name("\x65\x73\x63", parse_escape_combos))), name("\x48\x65\x78\x45\x73\x63\x61\x70\x65", join(str("\x5c"), choice(str("\x78"), str("\x58")), name("\x68\x65\x78", parse_HEX), name("\x68\x65\x78", parse_HEX))))(start));
        return memoTable.get("escape "+start);
    }
    function parse_escape_combos(start) {
        if(memoTable.has("escape_combos "+start)) return memoTable.get("escape_combos "+start);
        memoTable.set("escape_combos "+start, choice(str("\x6e"), str("\x74"), str("\x72"), str("\x22"), str("\x27"), str("\x5c"))(start));
        return memoTable.get("escape_combos "+start);
    }
    function parse_main(start) {
        if(memoTable.has("main "+start)) return memoTable.get("main "+start);
        memoTable.set("main "+start, join(parse__, repeat(join(parse_statement, parse__)))(start));
        return memoTable.get("main "+start);
    }
    function parse_statement(start) {
        if(memoTable.has("statement "+start)) return memoTable.get("statement "+start);
        memoTable.set("statement "+start, name("\x53\x74\x61\x74\x65\x6d\x65\x6e\x74", join(name("\x6e\x61\x6d\x65", parse_identifier), parse__, str("\x3d"), parse__, name("\x65\x78\x70\x72", parse_expr)))(start));
        return memoTable.get("statement "+start);
    }
    function parse_expr(start) {
        if(memoTable.has("expr "+start)) return memoTable.get("expr "+start);
        memoTable.set("expr "+start, parse_expr1(start));
        return memoTable.get("expr "+start);
    }
    function parse_expr1(start) {
        if(memoTable.has("expr1 "+start)) return memoTable.get("expr1 "+start);
        memoTable.set("expr1 "+start, choice(name("\x43\x68\x6f\x69\x63\x65", join(name("\x65\x78\x70\x72", parse_expr2), repeat_plus(join(parse__, str("\x7c"), parse__, name("\x65\x78\x70\x72", parse_expr2))))), parse_expr2)(start));
        return memoTable.get("expr1 "+start);
    }
    function parse_expr2(start) {
        if(memoTable.has("expr2 "+start)) return memoTable.get("expr2 "+start);
        memoTable.set("expr2 "+start, choice(name("\x4a\x6f\x69\x6e", join(name("\x65\x78\x70\x72", parse_expr3), repeat_plus(join(parse__, name("\x65\x78\x70\x72", parse_expr3))))), parse_expr3)(start));
        return memoTable.get("expr2 "+start);
    }
    function parse_expr3(start) {
        if(memoTable.has("expr3 "+start)) return memoTable.get("expr3 "+start);
        memoTable.set("expr3 "+start, parse_value(start));
        return memoTable.get("expr3 "+start);
    }
    function parse_value(start) {
        if(memoTable.has("value "+start)) return memoTable.get("value "+start);
        memoTable.set("value "+start, choice(name("\x4e\x6f\x45\x6d\x69\x74", join(str("\x21\x21"), parse__, name("\x65\x78\x70\x72", parse_value))), name("\x4e\x6f\x43\x6f\x6e\x73\x75\x6d\x65", join(str("\x26\x26"), parse__, name("\x65\x78\x70\x72", parse_value))), name("\x4e\x6f\x74", join(str("\x21"), parse__, name("\x65\x78\x70\x72", parse_value))), name("\x41\x6e\x64", join(str("\x26"), parse__, name("\x65\x78\x70\x72", parse_value))), name("\x45\x6d\x69\x74\x53\x6f\x75\x72\x63\x65", join(str("\x25"), parse__, name("\x65\x78\x70\x72", parse_value))), name("\x53\x74\x72\x69\x6e\x67", parse_string), join(str("\x28"), parse__, parse_expr, parse__, str("\x29")), name("\x52\x65\x70\x65\x61\x74\x50\x6c\x75\x73", join(str("\x7b"), parse__, name("\x65\x78\x70\x72", parse_expr), parse__, str("\x7d\x2b"))), name("\x52\x65\x70\x65\x61\x74", join(str("\x7b"), parse__, name("\x65\x78\x70\x72", parse_expr), parse__, str("\x7d"))), name("\x4f\x70\x74\x69\x6f\x6e\x61\x6c", join(str("\x5b"), parse__, name("\x65\x78\x70\x72", parse_expr), parse__, str("\x5d"))), name("\x43\x6f\x64\x65", join(str("\x60"), repeat(join(not(str("\x60")), name("\x63\x68\x61\x72", parse_ANY))), str("\x60"))), name("\x52\x61\x6e\x67\x65", join(name("\x66\x72\x6f\x6d", parse_char), str("\x2d"), name("\x74\x6f", parse_char))), name("\x4e\x61\x6d\x65\x64", join(name("\x6e\x61\x6d\x65", parse_identifier), str("\x28"), parse__, name("\x65\x78\x70\x72", parse_expr), parse__, str("\x29"))), name("\x54\x6f\x6b\x65\x6e", join(name("\x6e\x61\x6d\x65", parse_identifier), not(join(parse__, str("\x3d"))))))(start));
        return memoTable.get("value "+start);
    }
    
    // Begin
    let res = parse_main(0);
    if(!res.result || res.consumed !== code.length) {
        let at = new Ctx(greatestSuccessIndex);
        return {
            error: "Invalid syntax at "+at.line+":"+at.column,
            at, //ctx
        };
    } else {
        return new PEGNode("main", res.result, code, new Ctx(0), new Ctx(code.length));
    }
}