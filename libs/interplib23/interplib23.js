
const interplib23_stylesheet = new CSSStyleSheet();
interplib23_stylesheet.replaceSync(`
    * {
        box-sizing: border-box;
        font-family: "Segoe UI";
        margin: 0;
        padding: 0;
    }
    body {
        background: #dddddd;
        display: flex;
        flex-direction: column;
        padding: 2% 15%;
        gap: 1.4rem;
    }
    :root {
        --inset: inset;
        --outset: outset;
    }
    .dark-theme {
        filter: invert(1) hue-rotate(180deg); /* invert(1) inverts all colors, and hue-rotate cycles colors (hues) back to same as white theme */
        --inset: outset;
        --outset: inset;
    }
    button {
        border: 1px var(--outset) gray;
        background: #e8e8e8;
    }
    button:hover {
        background: #bbbbbb;
    }
    button:active {
        background: #888888;
    }
    button:disabled {
        background: lightgray;
    }

    header {
        display: flex;
        gap: 1.3rem;
        align-items: baseline; /* make text align good bottom */
    }
    header a, header p {
        font-size: 1.4rem;
    }
    header div {
        flex-grow: 1;
    }
    #theme {
        font-size: 1.3rem;
        padding: 0.1rem 0.2rem;
        margin-left: auto; /* pushes item to end, see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_alignment/Box_alignment_in_flexbox#alignment_and_auto_margins */
    }

    .buttons {
        display: flex;
        gap: 1rem;
    }
    .buttons button {
        font-size: 1.2rem;
        padding: 0.03rem 0.2rem;
    }

    code-area {
        border: 2px var(--inset);
        min-height: 40vh;
    }
    console-area {
        height: 20vh;
        border: 2px var(--inset);
    }
    
    
    
    code-area {
        display: flex; /* to make children use 100% height */
        flex-direction: column;
    }
    .code-area-scroll {
        background: white;
        flex-grow: 1;
        overflow-x: auto;
        display: flex;
    }
    .code-area-outer {
        background: white;
        position: relative;
        flex-grow: 1;
    }
    .code-area-textarea, .code-area-pre {
        border: none;
        resize: none;
        outline: none;
        width: 100%;
        height: 100%;
    }
    .code-area-textarea, .code-area-pre, .code-area-line-nums {
        padding: 0.2rem 0.2rem;
    }
    .code-area-textarea {
        position: absolute;
        top: 0;
        left: 0;
        background: transparent;
        color: transparent;
        caret-color: black;
    }
    .code-area-pre {

    }
    .code-area-textarea, .code-area-pre, .code-area-pre *, .code-area-line-nums, .code-area-line-nums * {
        font-family: monospace;
        font-size: 1rem;
        white-space: pre;
    }
    .code-area-textarea, .code-area-pre, .code-area-pre * {
        word-break: break-all;
    }
    .code-area-line-nums-wrapper {
        position: relative;
        width: 0;
        height: 0;
    }
    .code-area-line-nums {
        position: absolute;
        text-align: right;
        right: calc(100% + 2px + 0.3rem);
        padding-right: 0;
        color: #555555;
    }
    
    
    console-area {
        display: flex; /* to make children use 100% height */
        flex-direction: column;
        overflow-y: auto;
    }
    .console-area-outer {
        background: black;
        position: relative;
        flex-grow: 1;
    }
    console-area textarea, console-area pre {
        border: none;
        outline: none;
        width: 100%;
        height: 100%;
        resize: none;
    }
    console-area textarea, console-area pre, console-area pre * {
        white-space: pre-wrap;
        word-break: break-all;
    }
    console-area textarea {
        position: absolute;
        z-index: 1;
        background: transparent;
        color: transparent;
    }
    console-area pre {
        color: white;
    }
    .dark-theme .console-area-outer {
        filter: invert(1) hue-rotate(180deg);
    }
    console-area * {
        font-family: monospace;
        font-size: 1rem;
    }
    console-area pre .cursor {
        background: white;
        color: black;
    }
    console-area *::selection {
        background: white;
        color: black;
    }
`);
document.adoptedStyleSheets.push(interplib23_stylesheet);




// Dark Theme & Title h1
window.addEventListener("load", () => {
    const themeBtn = document.querySelector("button#theme");

    if(localStorage.getItem("darktheme") === "true") {
        document.documentElement.classList.add("dark-theme");
    }
    themeBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark-theme");
        localStorage.setItem("darktheme", document.documentElement.classList.contains("dark-theme"));
    });

    document.querySelector("h1").innerText = document.title;
});



class CodeArea extends HTMLElement {
    static observedAttributes = ["localstorage-name", "readonly"];

    constructor() {
        super();
    }

    connectedCallback() {
        this.scroller = document.createElement("div");
        this.outer = document.createElement("div");
        this.textarea = document.createElement("textarea");
        this.pre = document.createElement("pre");
        this.lineNumsWrapper = document.createElement("pre");
        this.lineNums = document.createElement("pre");
        
        this.scroller.classList.add("code-area-scroll");
        this.outer.classList.add("code-area-outer");
        this.textarea.classList.add("code-area-textarea");
        this.pre.classList.add("code-area-pre");
        this.lineNums.classList.add("code-area-line-nums");
        this.lineNumsWrapper.classList.add("code-area-line-nums-wrapper");
        this.textarea.spellcheck = false;
        if(this.hasAttribute("readonly")) {
            this.textarea.readOnly = true;
        }
        
        this.lineNumsWrapper.appendChild(this.lineNums);
        this.appendChild(this.lineNumsWrapper);
        this.outer.appendChild(this.textarea);
        this.outer.appendChild(this.pre);
        this.scroller.appendChild(this.outer);
        this.appendChild(this.scroller);

        const textarea = this.textarea, pre = this.pre, lineNums = this.lineNums;
        
        let localStorageKey = this.getAttribute("localstorage-name");
        if(localStorageKey === null || localStorageKey === "") throw new Error("code-area needs localstorage-key attribute");
        localStorageKey = "code-area-" + localStorageKey;
        if(localStorage.getItem(localStorageKey) !== null && localStorage.getItem(localStorageKey) !== "") textarea.value = localStorage.getItem(localStorageKey);


        let prevCode = null;
        this._rehighlight = false;
        let self = this;
        function updatePre() {
            if(prevCode !== null && prevCode === textarea.value && !self._rehighlight) return;
            self._rehighlight = false;
            if(prevCode === null || prevCode.split("\n").length !== textarea.value.split("\n").length) {
                lineNums.innerText = Array(textarea.value.split("\n").length).fill(0).map((_, i) => (i+1).toString()).join("\n");
            }
            let text = textarea.value;
            prevCode = text;

            // Do highlighting
            let colorStyles = Array(text.length).fill("");
            let bgStyles = Array(text.length).fill(null);
            self.highlightCallback(text, {
                color(start, end, cssColor) {
                    if(!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || typeof cssColor !== "string") throw new Error("Invalid interplib23 color() arguments");
                    for(let i=start; i<end; i++) {
                        colorStyles[i] = cssColor;
                    }
                },
                background(start, end, cssColor) {
                    if(!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || typeof cssColor !== "string") throw new Error("Invalid interplib23 background() arguments");
                    for(let i=start; i<end; i++) {
                        bgStyles[i] = cssColor;
                    }
                },
            });

            // Add spans
            pre.innerHTML = "";
            let currText = "", currColor = null, currBg = null;
            for(let i=0; i<text.length; i++) {
                if(currColor === colorStyles[i] && currBg === bgStyles[i]) {
                    currText += text[i];
                } else {
                    if(currText.length > 0) {
                        const span = document.createElement("span");
                        span.style = `color: ${currColor || "black"}; background-color: ${currBg || "transparent"}`;
                        span.innerText = currText;
                        pre.appendChild(span);
                    }
                    currText = text[i];
                    currColor = colorStyles[i];
                    currBg = bgStyles[i];
                }
            }
            if(currText.length > 0) {
                const span = document.createElement("span");
                span.style = `color: ${currColor || "black"}; background-color: ${currBg || "transparent"}`;
                span.innerText = currText;
                pre.appendChild(span);
            }
            pre.appendChild(document.createTextNode(" ")); // space for making the last line of pre count towards #code height when empty

            localStorage.setItem(localStorageKey, textarea.value);
        }
        textarea.addEventListener("input", (e) => {
            updatePre();
        });
        textarea.addEventListener("keydown", (e) => {
            if(e.key === "Tab") {
                e.preventDefault();
                let indexInLine = textarea.value.slice(0, textarea.selectionStart).split("\n").at(-1).length;
                textarea.setRangeText(" ".repeat(4 - (indexInLine % 4)), textarea.selectionStart, textarea.selectionEnd, "end");
                updatePre();
            }
        });
        this._getvalue = () => textarea.value;
        this._setvalue = function(val) {
            this.textarea.value = val;
            updatePre();
        };
        this._updatePre = updatePre;
        updatePre();
    }
    attributeChangedCallback(name, prev, curr) {
        if(name === "readonly" && this.textarea) {
            this.textarea.readOnly = this.hasAttribute("readonly");
        }
    }

    get value() { return this._getvalue(); }
    set value(val) { return this._setvalue(""+val); }
    get readOnly() { return this.hasAttribute("readonly"); }
    set readOnly(val) { if(val) this.setAttribute("readonly", ""); else this.removeAttribute("readonly"); }

    highlightCallback(text, { color, background }) {
        //function usage:
        //color(start, end, cssValue);
        //background(start, end, cssValue);

        // pass
    }
    rehighlight() {
        this._rehighlight = true;
        this._updatePre();
    }
}
customElements.define("code-area", CodeArea);


class ConsoleArea extends HTMLElement {
    static observedAttributes = [];

    constructor() {
        super();
    }

    connectedCallback() {
        this.outer = document.createElement("div");
        this.textarea = document.createElement("textarea");
        this.pre = document.createElement("pre");
        
        this.outer.classList.add("console-area-outer");
        this.textarea.classList.add("console-area-textarea");
        this.pre.classList.add("console-area-pre");
        this.textarea.spellcheck = false;
        
        this.outer.appendChild(this.textarea);
        this.outer.appendChild(this.pre);
        this.appendChild(this.outer);

        const consoleTextarea = this.textarea, consolePre = this.pre;
            
        let consoleCursorResetTime = Date.now();
        let consoleCurrOutput = "";
        let consoleCurrInput = "";
        consoleTextarea.value = consoleCurrOutput+consoleCurrInput;
        let consoleInputCallback = null; // non-null when waiting for input

        function updatePre() {
            const cursorVisible = document.activeElement === consoleTextarea &&
                consoleTextarea.selectionStart === consoleTextarea.selectionEnd &&
                (Date.now()-consoleCursorResetTime)%1000 < 500;
            const cursorIndex = cursorVisible ? consoleTextarea.selectionStart : null;

            if(cursorVisible) {
                consolePre.innerText = "";
                consolePre.appendChild(document.createTextNode(consoleTextarea.value.slice(0, cursorIndex)));
                let span = document.createElement("span");
                span.innerText = consoleTextarea.value.length <= cursorIndex || consoleTextarea.value[cursorIndex] === "\n" ? " " + (consoleTextarea.value[cursorIndex] === "\n" ? "\n" : "") : consoleTextarea.value.slice(cursorIndex, cursorIndex+1);
                span.classList.add("cursor");
                consolePre.appendChild(span);
                consolePre.appendChild(document.createTextNode(consoleTextarea.value.slice(cursorIndex+1) + " "));
            } else {
                consolePre.innerText = consoleTextarea.value + " ";
            }
        }
        setInterval(updatePre, 10);
        consoleTextarea.addEventListener("input", (e) => {
            consoleCursorResetTime = Date.now();

            if(consoleInputCallback && consoleTextarea.value.startsWith(consoleCurrOutput)) {
                consoleCurrInput = consoleTextarea.value.slice(consoleCurrOutput.length);
                consoleTextarea.value = consoleCurrOutput + consoleCurrInput;
                if(e.inputType === "insertLineBreak" && consoleTextarea.selectionStart === consoleTextarea.value.length) {
                    let input = consoleCurrInput;
                    consoleCurrOutput += consoleCurrInput;
                    consoleCurrInput = "";
                    consoleTextarea.value = consoleCurrOutput + consoleCurrInput;
                    consoleInputCallback(input);
                    consoleInputCallback = null;
                }
            } else {
                consoleTextarea.value = consoleCurrOutput + consoleCurrInput;
            }

            updatePre();
        });
        updatePre();

        document.addEventListener("mousedown", () => {
            consoleCursorResetTime = Date.now();
            updatePre();
        });
        consoleTextarea.addEventListener("keydown", () => {
            consoleCursorResetTime = Date.now();
            updatePre();
        });
        
        this._getvalue = () => consoleCurrOutput;
        this._setvalue = function(str) {
            consoleCurrOutput = str;
            consoleTextarea.value = consoleCurrOutput + consoleCurrInput;
            consoleCursorResetTime = Date.now();
            updatePre();
        }
        this._getch_buffer = "";
        this._output = function(str) {
            consoleCurrOutput += str;
            consoleTextarea.value = consoleCurrOutput + consoleCurrInput;
            consoleCursorResetTime = Date.now();
            updatePre();
        }
        this._input = async function() {
            if(consoleInputCallback) throw new Error("Interplib23 Console is already waiting for input!");
            return new Promise(async (res, rej) => {
                consoleInputCallback = (input) => {
                    res(input);
                };
            });
        }
        this._reset = function() {
            if(consoleInputCallback) {
                consoleInputCallback(consoleCurrInput);
                consoleInputCallback = null;
            }
            consoleCurrOutput = "";
            consoleCurrInput = "";
            this._getch_buffer = "";
            consoleTextarea.value = consoleCurrOutput + consoleCurrInput;
            consoleCursorResetTime = Date.now();
            updatePre();
        }
    }

    output(...args) {
        this._output(args.map(val => ""+val).join(" "));
    }
    write(...args) {
        this._output(args.map(val => ""+val).join(" "));
    }
    print(...args) {
        this._output(args.map(val => ""+val).join(" ") + "\n");
    }
    async input(...args) {
        this._output(args.map(val => ""+val).join(" "));
        return this._input();
    }
    async getch() {
        if(this._getch_buffer.length === 0) this._getch_buffer = await this._input();
        let ch = this._getch_buffer[0] ?? "\0";
        this._getch_buffer = this._getch_buffer.slice(1);
        return ch;
    }
    reset() {
        this._reset();
    }
    get value() { return this._getvalue(); }
    set value(val) { return this._setvalue(""+val); }
}
customElements.define("console-area", ConsoleArea);