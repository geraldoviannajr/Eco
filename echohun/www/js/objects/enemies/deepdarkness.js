class DeepDarkness extends Enemy {
    waveCount = 90;
    waveAmplitude = 2;
    bodyColor = `rgba(0,0,0,1)`;
    echoColor = [255, 0, 0, 0.8];    
    _soundChasing = game.sounds.getSound('ddChasing'); // Som tocado enquanto o inimigo está perseguindo
    _soundChasingId = null; // ID do som tocado enquanto o inimigo está perseguindo
    _soundVisible = null;
    _soundEcho = null;
    _attackRadiusOffset = 0;
    _attackForce = 30; 
    _distanceToAttack = 500;
    _hasEcho = false;
    constructor(x, y, name, radius = 100, speed = 0.4) {
        super(x, y, name, false, radius, speed);
        this.createCircleHitbox(0, 0, this.radius + 3);
    }    

    emitSecondaryAttack() {                        
        super.emitSecondaryAttack();      
        const littleDarkness = new LittleDarkness(this, this.x, this.y);
        console.log(` |-> Carregando inimigo: ${littleDarkness.name}`);
        littleDarkness.visible = true;
        littleDarkness.chasing = true;
        littleDarkness.chasingPoint = { x: game.player.x, y: game.player.y };            
        littleDarkness.navGrid = game.map.generateNavGrid(config.CELL_SIZE, littleDarkness.radius / 4);
        game.map.enemies.push(littleDarkness);
        game.map.objects.push(littleDarkness);
        this._lastAttack = window.game.gameTime; // Atualiza o tempo do último ataque
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
        if (!this.visible) return; // Se o inimigo não estiver visível, não desenha nada

        // Desenha os círculos ondulados
        const circle1Radius = this.radius;
        const circle2Radius = this.radius + 5;
        const now = window.game.gameTime;

        this.drawWavyCircle(circle1Radius, 0.002, "rgba(255, 0, 0, 0.5)", 0, now);
        this.drawWavyCircle(circle2Radius,-0.0015,"rgba(255, 50, 50, 0.3)",Math.PI / 2,now);
      
        // Desenha o corpo do inimigo
        game.ctx.fillStyle = this.bodyColor;
        game.ctx.beginPath();
        game.ctx.arc(this.x - game.camera.x, this.y - game.camera.y, this.radius, 0, Math.PI * 2);
        game.ctx.fill();

        super.draw(); // Chama o método draw da classe pai para desenhar o inimigo
    }    

}