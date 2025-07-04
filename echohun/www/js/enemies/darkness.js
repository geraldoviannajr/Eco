class Darkness extends Enemy {
    duration = 900; // Duração do eco
    constructor(x, y, name, radius = 5, speed = 0.4) {
        super(x, y, name, "echo", radius, speed);
    }
}