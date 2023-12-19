let impl = {
    highlightCallback: null, // same as for interplib23
    run: null, // run possibly async with no stepping, error will be shown, run(string code, { bool stop })
    run_stepping: null, // run async with stepping, if run is undefined this will be used for non-stepping too, run(string code, { async step(...), bool stop })
    // in run_stepping, stop should be checked after step()
};

// IMPL_JS
// END

{
    const mainCodeArea = document.querySelector("#main-code-area");
    const mainConsole = document.querySelector("#main-console-area");

    let highlightState = []; // array of { start: null, end: null, color: null }
    mainCodeArea.highlightCallback = function(code, { color, background }) {
        if(impl.highlightCallback) impl.highlightCallback(code, { color, background });
        for(let obj of highlightState) {
            background(obj.start, obj.end, obj.color);
        }
    };
    mainCodeArea.rehighlight();

    if(!impl.run && !impl.run_stepping) throw new Error("neither impl.run or impl.run_stepping was set");
    const runFastBtn = document.querySelector("#run-btn");

    let runSlowBtn, pauseBtn, stepBtn, runToCursorBtn;
    if(impl.run_stepping) {
        const btns = document.querySelector(".buttons");
        runFastBtn.innerText = "Run Fast";

        function makeButton(name, disabled = false) {
            let btn = document.createElement("button");
            btn.innerText = name;
            btn.disabled = disabled;
            btns.appendChild(btn);
            return btn;
        }
        runSlowBtn = makeButton("Run");
        pauseBtn = makeButton("Pause");
        stepBtn = makeButton("Step", true);
        runToCursorBtn = makeButton("Run to Cursor");
    }

    let runtimeObj = null;
    let _paused = false;
    let _stop_asap = false;
    let _steps_to_do = 0;
    let _runToCursor = false;
    const defaultRuntimeObj = {
        write: (...args) => mainConsole.write(...args),
        print: (...args) => mainConsole.print(...args),
        putch: (num) => { mainConsole.write(String.fromCharCode(num | 0)); },
        input: async (...args) => await mainConsole.input(...args),
        getch: async () => await mainConsole.getch(),
        clearOutput: () => mainConsole.reset(),
    };

    runFastBtn.addEventListener("click", async () => {
        if(runtimeObj) {
            runtimeObj.stop = true;
            runFastBtn.disabled = true;
            mainConsole.reset_input();
            return;
        }
        if(impl.run_stepping) {
            runSlowBtn.disabled = true;
            pauseBtn.disabled = true;
            runToCursorBtn.disabled = true;
        }
        runFastBtn.innerText = "Stop";
        runtimeObj = Object.assign({
            stop: false,
        }, defaultRuntimeObj);
        mainConsole.reset();
        try {
            await impl.run(mainCodeArea.value, runtimeObj);
        } catch(e) {
            console.log(e);
            if(e instanceof Error) e = e.message;
            mainConsole.write("Error: "+e);
        }
        runtimeObj = null;
        runFastBtn.disabled = false;
        runFastBtn.innerText = impl.run_stepping ? "Run Fast" : "Run";
        if(impl.run_stepping) {
            runSlowBtn.disabled = false;
            pauseBtn.disabled = false;
            runToCursorBtn.disabled = false;
        }
    });
    pauseBtn.addEventListener("click", () => {
        if(_paused === false) {
            _paused = true;
            pauseBtn.innerText = "Resume";
            if(!runtimeObj) runFastBtn.disabled = true;
            else stepBtn.disabled = false;
        } else {
            _paused = false;
            pauseBtn.innerText = "Pause";
            if(!runtimeObj) runFastBtn.disabled = false;
            else stepBtn.disabled = true;
        }
    });
    runToCursorBtn.addEventListener("click", () => {
        //TODO
    });
    runSlowBtn.addEventListener("click", async () => {
        if(runtimeObj) {
            _stop_asap = true;
            runSlowBtn.disabled = true;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            runToCursorBtn.disabled = true;
            mainConsole.reset_input();
            return;
        }
        runSlowBtn.innerText = "Stop";
        runFastBtn.disabled = true;
        if(_paused) {
            stepBtn.disabled = false;
        }
        _steps_to_do = 0;
        runtimeObj = Object.assign({
            stop: false,
            step: async (obj) => {
                let { code_done: doneObj, code_next: nextObj } = obj ?? {};
                highlightState = [];
                if(doneObj) {
                    highlightState.push({ start: doneObj.start, end: doneObj.end, color: "#00ff00" });
                }
                if(nextObj) {
                    highlightState.push({ start: nextObj.start, end: nextObj.end, color: "#dddddd" });
                }
                mainCodeArea.rehighlight();
                if(_stop_asap) {
                    runtimeObj.stop = true;
                    mainConsole.reset_input();
                    _stop_asap = false;
                } else if(_paused) {
                    if(_steps_to_do > 0) _steps_to_do--;
                    while(_paused && _steps_to_do === 0 && !_stop_asap) await new Promise(r => requestAnimationFrame(r));
                }
                await new Promise(r => requestAnimationFrame(r));
            },
        }, defaultRuntimeObj);
        mainConsole.reset();
        try {
            await impl.run_stepping(mainCodeArea.value, runtimeObj);
        } catch(e) {
            console.log(e);
            if(e instanceof Error) e = e.message;
            mainConsole.write("Error: "+e);
        }
        runtimeObj = null;
        _stop_asap = false;
        highlightState = [];
        mainCodeArea.rehighlight();
        runFastBtn.disabled = false;
        stepBtn.disabled = true;
        runSlowBtn.disabled = false;
        runSlowBtn.innerText = "Run";
        if(_paused) {
            // unpause
            _paused = false;
            pauseBtn.innerText = "Pause";
        }
        pauseBtn.disabled = false;
        runToCursorBtn.disabled = false;
    });
    stepBtn.addEventListener("click", () => {
        _steps_to_do++;
    });
}