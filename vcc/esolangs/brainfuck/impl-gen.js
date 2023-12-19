let lang = {
    "format_version": "vcc-v1",
    "lang": {
        "name": "brainfuck",
        "type": "esolang",
        "esolangs_org_url": "https://esolangs.org/wiki/Brainfuck",
        "sole_creator": "Urban Müller"
    },
    "impl": {
        "type": "standard_interplib"
    }
};


impl.highlightCallback = function(code, { color, background }) {
    for(let i=0; i<code.length; i++) {
        if("+-><.,[]".includes(code[i])) color(i, i+1, "#000011");
        else color(i, i+1, "#555555");
    }
};

impl.run = async function(code, runtime) {
    
    // Validate brackets
    let depth = 0;
    for(let i=0; i<code.length; i++) {
        if(code[i] === "[") depth++;
        if(code[i] === "]") depth--;
        if(depth < 0) throw new Error("Unmatched brackets []");
    }
    if(depth !== 0) throw new Error("Unmatched brackets []");

    // Compile to JS
    let compiled = "let mem=[0];let p=0;let loopIters=1;";
    for(let i=0; i<code.length; i++) {
        if(code[i] === "+") compiled += "mem[p]=(mem[p]+1)%256;";
        if(code[i] === "-") compiled += "mem[p]=(mem[p]+255)%256;";
        if(code[i] === ">") compiled += "p++;if(p>=mem.length)mem.push(0);";
        if(code[i] === "<") compiled += "p--;if(p<0)throw new Error('Pointer out bounds (<0)');";
        if(code[i] === ".") compiled += "out(mem[p]);";
        if(code[i] === ",") compiled += "if(mem[p]!=0)throw new Error('Cell must be 0 on input');mem[p]=((await inp())|0)%256;if(checkStop())return;";
        if(code[i] === "[") compiled += "while(mem[p]){";
        if(code[i] === "]") compiled += "if(checkStop())return;else if(loopIters===0)await new Promise(r=>setTimeout(r));loopIters=(loopIters+1)%100000;}"; // TODO make this Date.now()-dependent
    }

    // Run
    const AsyncFunction = (async _ => _).constructor; // AsyncFunction is not a global object (as of writing this)
    await (new AsyncFunction("inp", "out", "checkStop", compiled))(async () => runtime.getch(), (num) => runtime.putch(num), () => runtime.stop);
};


impl.run_stepping = async function(code, runtime) {
    
    // Validate brackets
    let depth = 0;
    for(let i=0; i<code.length; i++) {
        if(code[i] === "[") depth++;
        if(code[i] === "]") depth--;
        if(depth < 0) throw new Error("Unmatched brackets []");
    }
    if(depth !== 0) throw new Error("Unmatched brackets []");

    // Merge repeated +, -, >, <, but dont merge across comments (comments include whitespace)
    let instrs = [];
    for(let i=0; i<code.length; i++) {
        if("+-><".includes(code[i]) && instrs.length > 0 && instrs.at(-1).char === code[i] && "+-><".includes(code[i-1])) {
            instrs.at(-1).n++;
        } else {
            if(instrs.length > 0 && instrs.at(-1).end == null) instrs.at(-1).end = i;
            if("+-><".includes(code[i])) instrs.push({ char: code[i], start: i, n: 1 });
            else if(".,[]".includes(code[i])) instrs.push({ char: code[i], start: i });
        }
    }
    if(instrs.length > 0 && instrs.at(-1).end == null) instrs.at(-1).end = code.length;
    // Calculate bracket jump indices
    for(let i=0; i<instrs.length; i++) {
        if(instrs[i].char === "[") {
            let depth = 0;
            let j = i;
            while(true) {
                if(instrs[j].char === "[") depth++;
                if(instrs[j].char === "]") depth--;
                if(depth === 0) break;
                j++;
            }
            instrs[i].other_index = j;
            instrs[j].other_index = i;
        }
    }

    // Run
    let mem = [0];
    let p = 0;
    let lastDone = null;
    for(let i=0; i<instrs.length; i++) {
        await runtime.step({ code_next: { start: instrs[i].start, end: instrs[i].end }, code_done: lastDone });
        lastDone = { start: instrs[i].start, end: instrs[i].end };
        if(runtime.stop) break;
        if(instrs[i].char === "+") {
            mem[p] = (mem[p]+instrs[i].n)%256;
        } else if(instrs[i].char === "-") {
            mem[p] = (mem[p]+256-(instrs[i].n%256))%256;
        } else if(instrs[i].char === ">") {
            p += instrs[i].n;
            while(p >= mem.length) mem.push(0);
        } else if(instrs[i].char === "<") {
            p -= instrs[i].n;
            if(p < 0) throw new Error("Pointer out bounds (<0)");
        } else if(instrs[i].char === ".") {
            runtime.putch(mem[p]);
        } else if(instrs[i].char === ",") {
            if(mem[p] !== 0) throw new Error("Cell must be 0 on input");
            mem[p] = (await runtime.getch()|0)%256;
        } else if(instrs[i].char === "[") {
            if(mem[p] === 0) i = instrs[i].other_index;
        } else if(instrs[i].char === "]") {
            if(mem[p] !== 0) i = instrs[i].other_index;
        }
    }
};