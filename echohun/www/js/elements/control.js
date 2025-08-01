class Control {
    x = 0;
    y = 0;
    active = true;
    visible = true;
    radius = 22;
    constructor() { }

    draw() {
    }
    click() {
        console.log("Clicou em " + Object.prototype.toString.call(this));
    }
}