class Darkness extends Enemy {
    duration = 1500; // Duração do eco
    expansionSpeed = 4;
    lineCount = 24;
    _soundChasing = null;
    _soundChasingId = null;
    _soundVisible = null;
    _soundEcho = "step"; // Som tocado ao emitir eco  
    _attackRadiusOffset = 3; 
    _attackForce = 10; 
    
    constructor(x, y, name, radius = 5, speed = 0.8) {
        super(x, y, name, "echo", radius, speed);
    }
}