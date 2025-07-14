class LittleDarkness extends Enemy {
    parent = null; // Referência ao inimigo pai (DeepDarkness)
    bodyColor = `rgba(130,20,30,1)`;
    radius = 5;    
    speed = 0.9;
    _attackRadiusOffset = 2;
    _attackForce = 3;
    _hasEcho = false;     
    constructor(parent, x, y, name, radius = 1, speed = 0.9) {        
        super(x, y, name, false, radius, speed);
        this.parent = parent; // Define o inimigo pai
    }  
    draw() {
        super.draw();

        const ctx = game.ctx;
        const numLines = 18;
        const baseLength = this.radius * 2.5;
        const time = performance.now() * 0.008 + this.x * 0.1 + this.y * 0.1;

        ctx.save();
        ctx.translate(this.x - game.camera.x, this.y - game.camera.y);

        for (let i = 0; i < numLines; i++) {
            // Ângulo base para cada linha
            const angle = (2 * Math.PI * i) / numLines;
            // Comprimento variável para dar efeito frenético
            const jitter = Math.sin(time + i * 2.1) * this.radius * 1.2 + Math.random() * 2;
            const length = baseLength + jitter;

            // Cor e espessura variando para dar sensação de energia/agitação
            ctx.strokeStyle = `rgba(180,30,40,${0.45 + Math.random() * 0.3})`;
            ctx.lineWidth = 1 + Math.random() * 1.2;

            ctx.beginPath();
            ctx.moveTo(
                Math.cos(angle) * (this.radius * 0.5),
                Math.sin(angle) * (this.radius * 0.5)
            );
            ctx.lineTo(
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
            ctx.stroke();
        }

        ctx.restore();
    }  
}