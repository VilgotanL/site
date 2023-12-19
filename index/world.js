window.world = {
    mouseX: 0,
    mouseY: 0,
};


document.body.addEventListener("mousemove", (e) => {
    const bodyBounds = document.body.getBoundingClientRect();
    world.mouseX = e.pageX - bodyBounds.x;
    world.mouseY = e.pageY - bodyBounds.y;
});