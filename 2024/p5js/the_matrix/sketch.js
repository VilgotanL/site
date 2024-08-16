let w, h;
let cw, ch;

let falling;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let wantedCharW = 20;
  let wantedCharH = 20;
  w = Math.floor(width/wantedCharW);
  h = Math.floor(height/wantedCharH);
  cw = width/w;
  ch = height/h;
  
  falling = Array(w).fill(0).map(_ => []);
  frameRate(10);
  
  
  for(let el of document.getElementsByClassName("nav preview-nav")) {
    el.parentNode.removeChild(el);
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cw = width/w;
  ch = height/h;
}
function escapePressed() {
  return new Promise(res => {
    document.addEventListener("keydown", function listener(e) {
      if(e.code === "Escape") {
        document.removeEventListener("keydown", listener);
        res();
      }
    })
  });
}

let files = new Map();
const cmds = {
  echo: async (args) => {
    textarea.value += args.slice(1).join(" ")+"\n";
  },
  tree: async (args) => {
    for(let i=0; i<1000; i++) {
      textarea.value += Array(Math.floor(random(10, 40))).fill(0).map(_ => String.fromCharCode(random(32, 127))).join("")+"\n";
      await new Promise(r => setTimeout(r, 8));
    }
  },
  edit: async (args) => {
    let file = args[1];
    if(!file) throw new Error("edit: File name required");
    if(!files.has(file)) files.set(file, "");
    let prevValue = textarea.value;
    textarea.value = files.get(file);
    textarea.readOnly = false;
    await escapePressed();
    files.set(file, textarea.value);
    textarea.readOnly = true;
    textarea.value = prevValue+`Edited file ${file}\n`;
  },
  cat: async (args) => {
    let file = args[1];
    if(!file) throw new Error("cat: File name required");
    if(!files.has(file)) throw new Error("cat: Unknown file: "+file);
    textarea.value += files.get(file)+"\n";
  },
  del: async (args) => {
    let file = args[1];
    if(!file) throw new Error("del: File name required");
    if(!files.has(file)) throw new Error("del: Unknown file: "+file);
    files.delete(file);
  },
  ls: async (args) => {
    textarea.value += Array.from(files.keys()).join(" ")+"\n";
  },
};

let working = false;
let textarea = document.querySelector("textarea");
document.addEventListener("keydown", async (e) => {
  if(e.code === "Enter" && !working) {
    e.preventDefault();
    let cmd = textarea.value.split("\n").at(-1).split(" ").map(w => w.trim());
    textarea.value += "\n";
    if(cmds.hasOwnProperty(cmd[0])) {
      textarea.readOnly = true;
      working = true;
      try {
        await cmds[cmd[0]](cmd);
      } catch(e) {
        textarea.value += e.toString()+"\n";
      }
      working = false;
      textarea.readOnly = false;
    } else textarea.value += `Unknown command: ${cmd[0]}\n`;
  }
});
function updateScroll() {
  textarea.scrollTop = textarea.scrollHeight;
  requestAnimationFrame(updateScroll);
}
updateScroll();


function randomChinese() {
  return random(0x4e00, 0x9fff+1-100);
}

function draw() {
  background(0);
  if(frameCount%1 === 0) {
    falling[Math.floor(Math.random()*w)].push([random(0, 100), 0]);
  }
  if(true) {
    for(let i=0; i<falling.length; i++) {
      for(let j=0; j<falling[i].length; j++) {
        falling[i][j][1]++;
        if(falling[i][j][1] > h+10) {
          falling[i].splice(j, 1);
          j--;
        }
      }
    }
  }
  
  for(let x=0; x<w; x++) {
    for(let y=0; y<h; y++) {
      let chr = falling[x].filter(chr => chr[1] >= y).sort((a, b) => a[1]-b[1])[0];
      if(chr) {
        let brightness = map(chr[1]-y, 0, 16, 255, 0);
        brightness = constrain(brightness, 0, 255);
        textSize(ch);
        textAlign(CENTER, CENTER);
        if(y === chr[1]) fill(160, 255, 160);
        else fill(brightness*0.4, brightness, brightness=0.5);
        text(String.fromCharCode(randomChinese()+y+chr[1]), x*cw+cw/2, y*ch+ch/2);
      }
    }
  }
}