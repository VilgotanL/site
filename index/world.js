

class World {
    mouseX = 0;
    mouseY = 0;

    constructor() {

    }
}

window.world = new World();



class Camera {
    constructor(world) {
        if(!world) throw new Error("Camera missing world");
        this.world = world;
    }
}




document.body.addEventListener("mousemove", (e) => {
    const bodyBounds = document.body.getBoundingClientRect();
    world.mouseX = e.pageX - bodyBounds.x;
    world.mouseY = e.pageY - bodyBounds.y;
});