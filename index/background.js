{
    const canvas = document.querySelector("#bg-canvas");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let ctx = document.querySelector("#bg-canvas").getContext("2d");
    let width = canvas.width, height = canvas.height;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        width = window.innerWidth; height = window.innerHeight;
    });

    let cellsize = 4;
    let cellsizefloat = 4;
    let cells = [];
    let state = {};
    let xpos = 0, ypos = 0;
    let mode = "Game of Life";
    const drawModes = ["Game of Life"];

    function update() {

        if(mode === "Game of Life" && (!state.pause || state.doGen)) {
            state.doGen = false;
            let toCheck = new Set();
            let activeSet = new Set();
            let widthRadius = 0; // max abs x + 2 (+1 since width, +1 to expand by goflife rules)
            for(let [x, y] of cells) {
                widthRadius = Math.max(widthRadius, Math.abs(x) + 2);
            }
            for(let [x, y] of cells) {
                activeSet.add(x + 0 + 2 * widthRadius * (y + 0));
                toCheck.add(x + 0 + 2 * widthRadius * (y + 0));
                toCheck.add(x + 1 + 2 * widthRadius * (y + 0));
                toCheck.add(x - 1 + 2 * widthRadius * (y + 0));
                toCheck.add(x + 0 + 2 * widthRadius * (y + 1));
                toCheck.add(x + 1 + 2 * widthRadius * (y + 1));
                toCheck.add(x - 1 + 2 * widthRadius * (y + 1));
                toCheck.add(x + 0 + 2 * widthRadius * (y - 1));
                toCheck.add(x + 1 + 2 * widthRadius * (y - 1));
                toCheck.add(x - 1 + 2 * widthRadius * (y - 1));
            }
            let newCells = [];
            const mod = (a, b) => ((a % b) + b) % b;
            for(let v of toCheck.keys()) {
                let x = mod((v + widthRadius), (2 * widthRadius)) - widthRadius;
                let y = Math.floor((v + widthRadius) / (2 * widthRadius));
                let active = activeSet.has(x + 0 + 2 * widthRadius * (y + 0));
                let neighborsActive =
                    activeSet.has(x + 1 + 2 * widthRadius * (y + 0)) +
                    activeSet.has(x - 1 + 2 * widthRadius * (y + 0)) +
                    activeSet.has(x + 0 + 2 * widthRadius * (y + 1)) +
                    activeSet.has(x + 1 + 2 * widthRadius * (y + 1)) +
                    activeSet.has(x - 1 + 2 * widthRadius * (y + 1)) +
                    activeSet.has(x + 0 + 2 * widthRadius * (y - 1)) +
                    activeSet.has(x + 1 + 2 * widthRadius * (y - 1)) +
                    activeSet.has(x - 1 + 2 * widthRadius * (y - 1));
                if(neighborsActive === 3) active = true;
                else if(neighborsActive !== 2) active = false;
                if(active) newCells.push([x, y]);
            }
            cells = newCells;
        } else if(mode === "Rule 110") {
            if(cells.length === 0) cells.push([1]);
            
            for(let y=cells.length; y<Math.ceil((ypos+height)/cellsize); y++) {
                let prev = cells[y-1];
                let row = [];
                for(let x=0; x<y+1; x++) {
                    row.push((prev[x-1] || prev[x]) && !(prev[x-2] && prev[x-1] && prev[x]) ? 1 : 0);
                }
                cells.push(row);
            }
        } else if(mode === "Langton's ant") {
            if(cells.x == null) {
                cells.x = Math.floor(width/cellsize/2);
                cells.y = Math.floor(height/cellsize/2);
                cells.dx = 0;
                cells.dy = -1;
            }

            let currSquareIndex = cells.findIndex(([x, y]) => x === cells.x && y === cells.y);
            if(currSquareIndex === -1) {
                cells.push([cells.x, cells.y]);
                [cells.dx, cells.dy] = [-cells.dy, cells.dx];
                cells.x += cells.dx;
                cells.y += cells.dy;
            } else {
                cells.splice(currSquareIndex, 1);
                [cells.dx, cells.dy] = [cells.dy, -cells.dx];
                cells.x += cells.dx;
                cells.y += cells.dy;
            }
        }


        
        ctx.lineWidth = 0;
        ctx.fillStyle = "white";
        if(mode === "Rule 110") {
            ctx.clearRect(0, 0, width, height);
            for(let y=Math.max(0, Math.floor(ypos/cellsize)); y<Math.min(cells.length, Math.ceil((ypos+height)/cellsize)); y++) {
                let row = cells[y];
                for(let x=Math.max(0, Math.floor(xpos/cellsize)+y+1); x<Math.min(row.length, Math.ceil((xpos+width)/cellsize))+y+1; x++) {
                    if(row[x]) ctx.fillRect((x-(y+1))*cellsize-xpos, y*cellsize-ypos, cellsize, cellsize);
                }
            }
        } else {
            ctx.clearRect(0, 0, width, height);

            for(let [x, y] of cells) {
                ctx.fillRect(x*cellsize-xpos, y*cellsize-ypos, cellsize, cellsize);
            }
        }

        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    function getLineCoords(x1, y1, x2, y2) {
        let line = [];
        if(x1 === x2 && y1 === y2) {
            return [[Math.round(x1), Math.round(y1)]];
        } else if(Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
            if(x2 < x1) [x1, x2, y1, y2] = [x2, x1, y2, y1];
            for(let x = x1; x <= x2; x++) {
                line.push([Math.round(x), Math.round(y1 + (x - x1) / (x2 - x1) * (y2 - y1))]);
            }
        } else {
            if(y2 < y1) [x1, x2, y1, y2] = [x2, x1, y2, y1];
            for(let y = y1; y <= y2; y++) {
                line.push([Math.round(x1 + (y - y1) / (y2 - y1) * (x2 - x1)), Math.round(y)]);
            }
        }
        return line;
    }

    
    function mouseDrawLine(x1, y1, x2, y2, setActive) {
        let points = getLineCoords(x1, y1, x2, y2);

        let maxRadius = 0;
        for(let [x, y] of cells) maxRadius = Math.max(Math.abs(x), maxRadius);
        let multiple = 2*maxRadius+1;
        let indicesByHash = new Map();
        for(let [i, [x, y]] of cells.entries()) {
            indicesByHash.set(multiple*y+x, i);
        }
        
        let toChange = [];
        for(let [x, y] of points) {
            let has = indicesByHash.has(multiple*y+x);
            if(has === setActive) continue;
            else toChange.push([x, y]);
        }
        if(setActive) {
            for(let [x, y] of toChange) {
                cells.push([x, y]);
            }
        } else {
            for(let i=0; i<toChange.length; i++) {
                toChange[i] = indicesByHash.get(multiple*toChange[i][1]+toChange[i][0]);
            }
            toChange.sort((a, b) => a - b);
            let nSpliced = 0;
            for(let index of toChange) {
                cells.splice(index-nSpliced, 1);
                nSpliced++;
            }
        }
    }
    let prevPageX, prevPageY;
    window.addEventListener("mousedown", (e) => {
        prevPageX = e.pageX; prevPageY = e.pageY;
        if((e.buttons % 2 === 1 || e.buttons % 4 >= 2) && drawModes.includes(mode)) {
            let x = Math.floor((e.pageX+xpos)/cellsize), y = Math.floor((e.pageY+ypos)/cellsize);
            mouseDrawLine(x, y, x, y, e.buttons % 2 === 1);
        }
    });
    window.addEventListener("mousemove", (e) => {
        if((e.buttons % 2 === 1 || e.buttons % 4 >= 2) && drawModes.includes(mode)) {
            let x1 = Math.floor((prevPageX+xpos)/cellsize), y1 = Math.floor((prevPageY+ypos)/cellsize), x2 = Math.floor((e.pageX+xpos)/cellsize), y2 = Math.floor((e.pageY+ypos)/cellsize);
            mouseDrawLine(x1, y1, x2, y2, e.buttons % 2 === 1);
        }
        if((!drawModes.includes(mode) && e.buttons % 8 > 0) || e.buttons % 8 >= 4) {
            xpos -= e.movementX;
            ypos -= e.movementY;
            const bodyBounds = document.body.getBoundingClientRect();
            document.body.style.marginLeft = (bodyBounds.x+e.movementX)+"px";
            document.body.style.marginTop = (bodyBounds.y+e.movementY)+"px";
            e.preventDefault();
        }
        prevPageX = e.pageX; prevPageY = e.pageY;
    });
    let spaceDown = false;
    window.addEventListener("keydown", (e) => {
        if(e.key === " ") {
            if(mode === "Game of Life" && !spaceDown) state.pause = !state.pause;
            spaceDown = true;
        } else if(e.key === "Enter") {
            if(mode === "Game of Life" && state.pause) state.doGen = true;
        }
    });
    window.addEventListener("keyup", (e) => {
        if(e.key === " ") {
            spaceDown = false;
        }
    });
    window.addEventListener("wheel", (e) => {
        if(true) return;
        cellsizefloat *= 2**(-e.deltaY/500);
        if(cellsizefloat < 1) cellsizefloat = 1;
        if(cellsizefloat > 32) cellsizefloat = 32;
        if(!isFinite(cellsizefloat)) cellsizefloat = cellsize;
        let prevCellSize = cellsize;
        cellsize = Math.round(cellsizefloat);
        xpos += Math.round((e.pageX+xpos)/prevCellSize*cellsize-xpos-e.pageX);
        ypos += Math.round((e.pageY+ypos)/prevCellSize*cellsize-ypos-e.pageY);
    });

    document.querySelector("#bg-btn").addEventListener("click", () => {
        cells = [];
        state = {};
        xpos = 0;
        ypos = 0;
        if(mode === "Game of Life") {
            mode = "Langton's ant";
        } else if(mode === "Langton's ant") {
            mode = "Rule 110";
            xpos = Math.floor(-width*0.7);
            ypos = Math.floor(-height*0.3);
        } else if(mode === "Rule 110") {
            mode = "Game of Life";
        }
        document.querySelector("#bg-btn").innerText = mode;
    });
}