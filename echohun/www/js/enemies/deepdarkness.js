class DeepDarkness extends Enemy {
    waveCount = 90;
    waveAmplitude = 2;
    bodyColor = `rgba(0,0,0,1)`;
    echoColor = [255, 0, 0, 0.8];
    expansionSpeed = 4;
    lineCount = 36;
    constructor(x, y, name, radius = 120, speed = 0.2) {
        super(x, y, name, "radar", radius, speed);
    }    

    emitAttack = () => {
        // Emite um inimigo adiconal do tipo littleDarkness, como se fosse um filho e este inimigo já é criado com o chassing = true e o chassingpoint atual setado para a posição do player
        const littleDarkness = new LittleDarkness(this.x, this.y, "Little Darkness", 10, 0.8);
        littleDarkness.chassing = true;
        littleDarkness.chassingPoint = { x: game.player.x, y: game.player.y };
        game.map.enemies.push(littleDarkness);
        // Adiciona o littleDarkness ao navGrid do mapa
        littleDarkness.navGrid = game.map.generateNavGrid(config.CELL_SIZE, littleDarkness.radius / 4);        
    };

    // Desenha um círculo ondulado
    drawWavyCircle(radius, speed, color, rotationOffset, time) {
        game.ctx.beginPath();
        const ctxX = this.x - window.game.camera.x;
        const ctxY = this.y - window.game.camera.y;

        for (let i = 0; i <= 360; i += 5) {
        const angle = (i * Math.PI) / 180;
        const wave =
            Math.sin(angle * this.waveCount + time * speed + rotationOffset) *
            this.waveAmplitude;
        const r = radius + wave;
        const x = ctxX + Math.cos(angle) * r;
        const y = ctxY + Math.sin(angle) * r;
        if (i === 0) game.ctx.moveTo(x, y);
        else game.ctx.lineTo(x, y);
        }
        game.ctx.closePath();
        game.ctx.strokeStyle = color;
        game.ctx.lineWidth = 2;
        game.ctx.stroke();
    }

    draw() {
        // Desenha os círculos ondulados
        const circle1Radius = this.radius;
        const circle2Radius = this.radius + 5;
        const now = Date.now();

        this.drawWavyCircle(circle1Radius, 0.002, "rgba(255, 0, 0, 0.5)", 0, now);
        this.drawWavyCircle(circle2Radius,-0.0015,"rgba(255, 50, 50, 0.3)",Math.PI / 2,now);
      
        // Desenha o corpo do inimigo
        game.ctx.fillStyle = this.bodyColor;
        game.ctx.beginPath();
        game.ctx.arc(this.x - game.camera.x, this.y - game.camera.y, this.radius, 0, Math.PI * 2);
        game.ctx.fill();
    }    

}