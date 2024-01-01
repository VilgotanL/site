let impl = {
    highlightCallback: null, // same as for interplib23
    run: null, // run possibly async with no stepping, error will be shown, run(string code, { bool stop })
    run_stepping: null, // run async with stepping, if run is undefined this will be used for non-stepping too, run(string code, { async step(...), bool stop })
    // in run_stepping, stop should be checked after step()
};
function assert(bool, msg) {
    if(!bool) throw new Error(msg ?? "Assertion failed");
}

// IMPL_JS
// END

{
    const mainCodeArea = document.querySelector("#main-code-area");
    const mainConsole = document.querySelector("#main-console-area");

    mainConsole.useNullAsInputSep = true; // TODO make configurable?
    
    const defaultRuntimeObj = {
        write: (...args) => mainConsole.write(...args),
        print: (...args) => mainConsole.print(...args),
        putch: (num) => { mainConsole.write(String.fromCharCode(num | 0)); },
        input: async (...args) => await mainConsole.input(...args),
        getch: async () => await mainConsole.getch(),
        clearOutput: () => mainConsole.reset(),
    };
    
    function makeButton(name) {
        let btn = document.createElement("button");
        btn.innerText = name;
        btn.addEventListener("mousedown", (e) => {
            e.preventDefault(); // prevent defocusing code area
        });
        document.querySelector(".buttons").appendChild(btn);
        return btn;
    }
    if(!impl.run && !impl.run_stepping) throw new Error("neither impl.run or impl.run_stepping was set"); // TODO support when only run_stepping

    const btns = {
        runFastBtn: null,
        runSlowBtn: null,
        pauseBtn: null,
        stepBtn: null,
        runToCursorBtn: null,
    };
    if(impl.run_stepping) {
        btns.runFastBtn = makeButton("Quick Run");
        btns.runSlowBtn = makeButton("Run");
        btns.pauseBtn = makeButton("Pause");
        btns.stepBtn = makeButton("Step");
        btns.runToCursorBtn = makeButton("Run to Cursor");
    } else {
        btns.runFastBtn = makeButton("Run");
    }

    const state = {
        running: false, // false, "fast", or "slow"
        paused: false,
        fast_state: null,
        slow_state: null,
    };
    function setFastRunning() {
        assert(state.running === false);
        state.running = "fast";
        state.fast_state = {
            runtimeObj: Object.assign({ stop: false }, defaultRuntimeObj),
        };
    }
    function setSlowRunning() {
        assert(state.running === false);
        assert(impl.run_stepping);
        state.running = "slow";
        const runtimeObj = Object.assign({
            stop: false,
            step: async (obj) => { //TODO
                let { code_done: doneObj, code_next: nextObj } = obj ?? {};
                state.slow_state.highlightState = [];
                if(doneObj) {
                    state.slow_state.highlightState.push({ start: doneObj.start, end: doneObj.end, color: "#00ff00" });
                }
                if(nextObj) {
                    state.slow_state.highlightState.push({ start: nextObj.start, end: nextObj.end, color: "#dddddd" });
                }
                mainCodeArea.rehighlight();
                if(state.slow_state.runToCursor) {
                    //disable if check TODO
                    // TODO maybe rewrite all this into while(true) loop
                }
                if(state.slow_state.stopping) {
                    state.slow_state.runtimeObj.stop = true;
                    mainConsole.reset_input();
                    state.slow_state.stopping = false;
                } else if(state.paused && !state.slow_state.runToCursor) {
                    if(state.slow_state.stepsToDo > 0) state.slow_state.stepsToDo--;
                    stateUpdate();
                    while(state.paused && state.slow_state.stepsToDo === 0 && !state.slow_state.stopping && !state.slow_state.runToCursor) await new Promise(r => requestAnimationFrame(r));
                }
                stateUpdate();
                await new Promise(r => requestAnimationFrame(r));
            },
        }, defaultRuntimeObj);
        state.slow_state = {
            stopping: false,
            stepsToDo: 0,
            runToCursor: false,
            runtimeObj: runtimeObj,
            highlightState: [], // array of { start: null, end: null, color: null }
        };
    }

    function stateUpdate() {
        if(impl.run_stepping) btns.pauseBtn.innerText = state.paused ? "Resume" : "Pause";
        if(state.running === false) {
            btns.runFastBtn.disabled = false;
            btns.runFastBtn.innerText = impl.run_stepping ? "Quick Run" : "Run";
            if(impl.run_stepping) {
                btns.runSlowBtn.disabled = false;
                btns.runSlowBtn.innerText = "Run";
                btns.pauseBtn.disabled = false;
                btns.stepBtn.disabled = true;
                btns.runToCursorBtn.disabled = false;
                btns.runToCursorBtn.innerText = "Run to Cursor";
            }
        } else if(state.running === "fast") {
            btns.runFastBtn.disabled = false;
            if(state.fast_state.runtimeObj.stop) btns.runFastBtn.disabled = true;
            btns.runFastBtn.innerText = "Stop";
            if(impl.run_stepping) {
                btns.runSlowBtn.disabled = true;
                btns.pauseBtn.disabled = true;
                btns.stepBtn.disabled = true;
                btns.runToCursorBtn.disabled = true;
            }
        } else if(state.running === "slow") {
            assert(impl.run_stepping);
            btns.runFastBtn.disabled = true;
            btns.runSlowBtn.innerText = "Stop";
            if(state.slow_state.runtimeObj.stop || state.slow_state.stopping) {
                btns.runSlowBtn.disabled = true;
                btns.pauseBtn.disabled = true;
                btns.stepBtn.disabled = true;
                btns.runToCursorBtn.disabled = true;
            } else {
                btns.runSlowBtn.disabled = false;
                btns.pauseBtn.disabled = false;
                btns.stepBtn.disabled = !state.paused && !state.slow_state.runToCursor;
                btns.runToCursorBtn.disabled = !state.slow_state.runToCursor && !state.paused;
                btns.runToCursorBtn.innerText = state.slow_state.runToCursor ? "Cancel" : "Run to Cursor";
            }
        }
    }

    mainCodeArea.highlightCallback = function(code, { color, background }) {
        if(impl.highlightCallback) impl.highlightCallback(code, { color, background });
        if(state.running === "slow") {
            for(let obj of state.slow_state.highlightState) {
                background(obj.start, obj.end, obj.color);
            }
        }
    };
    mainCodeArea.rehighlight();


    btns.runFastBtn.addEventListener("click", async () => {
        if(state.running === "fast" && state.fast_state.runtimeObj) {
            state.fast_state.runtimeObj.stop = true;
            mainConsole.reset_input();
            stateUpdate();
            return;
        }
        assert(state.running === false);
        setFastRunning();
        stateUpdate();
        mainConsole.reset();
        try {
            await impl.run(mainCodeArea.value, state.fast_state.runtimeObj);
        } catch(e) {
            console.log(e);
            if(e instanceof Error) e = e.message;
            mainConsole.write("Error: "+e);
        }
        state.running = false;
        state.fast_state = null;
        stateUpdate();
    });
    btns.pauseBtn.addEventListener("click", () => {
        if(state.paused === false) {
            state.paused = true;
            stateUpdate();
        } else {
            state.paused = false;
            stateUpdate();
        }
    });
    btns.runToCursorBtn.addEventListener("click", async () => {
        if(state.running === false) {
            await runSlow(true);
        } else if(state.running === "slow") {
            if(state.slow_state.runToCursor === true) {
                state.slow_state.runToCursor = false;
                stateUpdate();
            } else {
                state.slow_state.runToCursor = true;
                stateUpdate();
            }
        }
    });
    async function runSlow(runToCursor = false) {
        assert(state.running === false);
        setSlowRunning();
        if(runToCursor) {
            state.slow_state.runToCursor = true;
        }
        stateUpdate();
        mainConsole.reset();
        try {
            await impl.run_stepping(mainCodeArea.value, state.slow_state.runtimeObj);
        } catch(e) {
            console.log(e);
            if(e instanceof Error) e = e.message;
            mainConsole.write("Error: "+e);
        }
        state.running = false;
        state.slow_state = null;
        mainCodeArea.rehighlight();
        stateUpdate();
    }
    btns.runSlowBtn.addEventListener("click", async () => {
        if(state.running === "slow" && state.slow_state.runtimeObj) {
            state.slow_state.stopping = true;
            mainConsole.reset_input();
            stateUpdate();
            return;
        }
        await runSlow();
    });
    btns.stepBtn.addEventListener("click", () => {
        if(state.running === "slow") {
            state.slow_state.stepsToDo++;
        }
    });
}