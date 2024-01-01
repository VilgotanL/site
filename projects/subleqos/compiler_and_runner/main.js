const codeArea = document.querySelector("code-area");
const consoleArea = document.querySelector("console-area");
const runBtn = document.querySelector("#run-btn");
const compileBtn = document.querySelector("#compile-btn");




compileBtn.addEventListener("click", () => {
    consoleArea.reset();

    try {
        const res = parse(codeArea.value);
        const js = res.emitted;
        console.log(js);

        const func = new Function(js);
        const subleq = func();
        consoleArea.write(subleq);
    } catch(e) {
        console.log(e);
        consoleArea.print(e.message);
    }
});
runBtn.addEventListener("click", async () => {
    consoleArea.reset();

    runBtn.disabled = true;
    compileBtn.disabled = true;

    try {
        const res = parse(codeArea.value);
        const js = res.emitted;
        console.log(js);

        const func = new Function(js);
        const subleq = func();
        console.log(subleq);

        const mem = subleq.split(" ").map(v => Number(v));
        if(!mem.every(n => Number.isSafeInteger(n))) throw new Error("Resulting subleq integers don't fit inside Number.isSafeInteger");
        let p = 0;

        let lastAnimationFrame = Date.now();
        while(p >= 0) {
            while(p+2 >= mem.length) mem.push(0);
            let a = mem[p], b = mem[p+1], c = mem[p+2];

            if(a > 500000 || b > 500000 || c > 500000) {
                console.log("mem:", mem);
                throw new Error("Subleq operand exceeded safe memory upper bound");
            }
            while(a >= mem.length || b >= mem.length || c >= mem.length) mem.push(0);

            if(a < 0 || b < 0) {
                if(a === -1 && b >= 0) {
                    if(c !== p+3) throw new Error("c operand must be p+3 on I/O");
                    //console.log("input at p", p);
                    mem[b] = await consoleArea.getch() | 0;
                    //console.log("input integer:", mem[b]);
                    p += 3;
                } else if(a >= 0 && b === -1) {
                    if(c !== p+3) throw new Error("c operand must be p+3 on I/O");
                    //console.log("output at p", p);
                    consoleArea.write(String.fromCodePoint(mem[a]));
                    //console.log("output integer:", mem[a]);
                    p += 3;
                } else throw new Error(`Unknown instruction: ${a} ${b} ${c} at p=${p}`);
            } else {
                mem[b] -= mem[a];
                if(mem[b] <= 0) p = c;
                else p += 3;
            }

            if(Date.now() - lastAnimationFrame > 50) {
                console.log(p);
                await new Promise(res => requestAnimationFrame(res));
                lastAnimationFrame = Date.now();
            }
        }
        console.log("mem after:", mem);
    } catch(e) {
        console.log(e);
        consoleArea.print(e.message);
    }
    runBtn.disabled = false;
    compileBtn.disabled = false;
});