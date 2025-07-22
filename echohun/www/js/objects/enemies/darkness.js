class Darkness extends Enemy {
    speed = 0.3;
    duration = 1300; // Duração do eco
    expansionSpeed = 4;
    lineCount = 24;
    _soundChasing = null;
    _soundChasingId = null;
    _soundVisible = null;
    _attackRadiusOffset = 3; 
    _attackForce = 10; 
    _hasEcho = true;
    
    constructor(x, y, name, radius = 5, speed = 0.8) { 
        super(x, y, name, false, radius, speed); 
    }

    draw() {
        super.draw();
    }
}