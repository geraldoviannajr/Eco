class CrazyDarkness extends Enemy {
    duration = 500; // Duração do eco
    expansionSpeed = 4;
    lineCount = 24;
    _soundChasing = null;
    _soundChasingId = null;
    _soundVisible = null;
    _soundEcho = "step"; // Som tocado ao emitir eco  
    _attackRadiusOffset = 3; 
    _attackForce = 10; 
    _hasEcho = false;
    
    constructor(x, y, name, radius = 5, speed = 0.8) {
        super(x, y, name, false, radius, speed);
    }

    draw() {
        super.draw(); // Chama o método draw da classe pai para desenhar o inimigo
        if (this.visible) {
            const ctx = game.ctx;
            const cx = this.x - game.camera.x;
            const cy = this.y - game.camera.y;
            const time = performance.now() * 0.002;

            ctx.save();

            // Círculo pulsante no centro
            const pulse = Math.sin(time) * (this.radius * 0.25);
            ctx.beginPath();
            ctx.arc(cx, cy, this.radius + pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,30,30,0.7)`;
            ctx.fill();

            // Arcos/ondas expandindo
            const arcCount = 4;
            for (let i = 0; i < arcCount; i++) {
                // Cada arco tem um tempo de início diferente
                const t = ((time + i * 0.7) % 2.5) / 2.5;
                const r = this.radius + t * this.radius; // Expande do raio até o dobro do raio
                const alpha = 0.4 * (1 - t); // Vai desaparecendo

                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,80,80,${alpha})`;
                ctx.lineWidth = 2 + (1 - t) * 2;
                ctx.stroke();
            }

            ctx.restore();
        }        
    }
}