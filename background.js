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
    let cells = [];
    let xpos = 0, ypos = 0;
    let mode = "Game of Life";

    function update() {

        if(mode === "Game of Life") {
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
        ctx.fillStyle = "black";
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

    window.addEventListener("mousemove", (e) => {
        if(e.buttons % 2 === 1 && (mode !== "Rule 110" && mode !== "Langton's ant")) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.cancelBubble = true;
            for(let [x, y] of getLineCoords(Math.floor((e.pageX-e.movementX+xpos)/cellsize), Math.floor((e.pageY-e.movementY+ypos)/cellsize), Math.floor((e.pageX+xpos)/cellsize), Math.floor((e.pageY+ypos)/cellsize))) {
                cells = cells.filter(([x2, y2]) => !(x === x2 && y === y2));
                cells.push([x, y]);
            }
        }
        if(e.buttons % 4 >= 2 || ((mode === "Rule 110" || mode === "Langton's ant") && e.buttons % 2 === 1)) {
            xpos -= e.movementX;
            ypos -= e.movementY;
        }
    });

    document.querySelector("#bg-btn").addEventListener("click", () => {
        cells = [];
        xpos = 0;
        ypos = 0;
        if(mode === "Game of Life") {
            mode = "Langton's ant";
        } else if(mode === "Langton's ant") {
            mode = "Rule 110";
            xpos = Math.floor(-width*0.7);
            ypos = Math.floor(-height*0.3);
        } else if(mode === "Rule 110") {
            mode = "Drawing";
        } else if(mode === "Drawing") {
            mode = "Game of Life";
        }
        document.querySelector("#bg-btn").innerText = mode;
    });
}