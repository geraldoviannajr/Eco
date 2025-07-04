class LittleDarkness extends Enemy {
    constructor(x, y, name, radius = 1, speed = 0.8) {
        super(x, y, name, "radar", radius, speed);
    }  
    draw() {
        super.draw();
    }  
}