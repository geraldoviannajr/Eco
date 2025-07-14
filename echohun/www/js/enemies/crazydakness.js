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
            const time = performance.now() * 0.012;
            ctx.save();
            ctx.translate(cx, cy);

            // Efeito de "olhos" piscando ao redor
            const eyes = 6;
            for (let i = 0; i < eyes; i++) {
                const angle = (2 * Math.PI * i) / eyes + Math.sin(time + i) * 0.2;
                const dist = this.radius * 2.2 + Math.sin(time * 2 + i) * 4;
                ctx.beginPath();
                ctx.arc(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist,
                    2 + Math.abs(Math.sin(time * 3 + i)) * 2,
                    0, Math.PI * 2
                );
                ctx.fillStyle = `rgba(255,30,30,${0.5 + Math.abs(Math.sin(time + i)) * 0.5})`;
                ctx.fill();
            }

            // Efeito de arcos semicirculares pulsando
            const arcCount = 3;
            for (let j = 0; j < arcCount; j++) {
                ctx.beginPath();
                const r = this.radius * (1.5 + j * 0.7) + Math.sin(time * 2 + j) * 3;
                ctx.arc(0, 0, r, Math.PI * 0.2, Math.PI * 1.8);
                ctx.strokeStyle = `rgba(180,0,0,${0.3 + j * 0.2})`;
                ctx.lineWidth = 1.5 + Math.sin(time * 2 + j) * 0.7;
                ctx.stroke();
            }

            ctx.restore();
        }        
    }
}