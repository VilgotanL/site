{
    const ctxmenu = document.querySelector(".contextmenu");

    
    let isOpen = false;
    function open_menu() {
        if(isOpen) close_menu();
        isOpen = true;
        ctxmenu.style.marginLeft = world.mouseX+"px";
        ctxmenu.style.marginTop = world.mouseY+"px";
        ctxmenu.classList.add("contextmenu-visible");
    }
    function close_menu() {
        if(!isOpen) return;
        isOpen = false;
        ctxmenu.classList.remove("contextmenu-visible");
    }


    document.body.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
    document.body.addEventListener("mousedown", (e) => {
        if(e.buttons % 4 >= 2) {
            open_menu();
            justOpened = true;
        } else if(!ctxmenu.contains(e.target) && e.buttons % 8 < 4) {
            close_menu();
        }
    });
    close_menu();
}