class Enemy {
  // type: 'echo' | 'radar'
  constructor(x, y, type = 'echo', size = 20, speed = 0.4) {
    this.x = x;
    this.y = y;    
    this.type = type;
    this.waveCount = 90;
    this.waveAmplitude = 2;
    this.size = size;
    this.speed = 0.2;
    this.miliSecBetweenEchos = 1000;
    this.chasing = false;
    this.visible = false;
    this.touchingLines= 0;
    this.detectionCoolDown = 3000;
    this.lastDetection = Date.now();
    this.bodyColor = `rgba(0,0,0,1)`;
    this.echoColor = [255, 0, 0, 0.8];
    this.expansionSpeed = 4;
    this.duration = 1300;
    this.lineCount = 24;
    this.lastEcho = Date.now();
  }

  // Verifica se o inimigo está colidindo com uma linha ou se está se movimentando
  update() {
    const now = Date.now();
    
    if (this.chasing) {      
        const millisecondsDifference = now - this.lastEcho;
        const prevX = this.x;
        const prevY = this.y;      
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < this.speed) return;
        const nx = dx / dist;
        const ny = dy / dist;
        const nextX = this.x + nx * this.speed;
        const nextY = this.y + ny * this.speed;
        if (!isColliding(nextX, this.y, this.size + 10)) this.x = nextX;
        if (!isColliding(this.x, nextY, this.size + 10)) this.y = nextY;

        let moved = player.x !== prevX || player.y !== prevY;

        if (moved) {
            if (this.type == 'echo' && millisecondsDifference >= this.miliSecBetweenEchos || this.forceNextStep) {
                this.lastEcho = now;
                this.forceNextStep = false;
                emitEnemyEcho(this);
                //playStepSound(false);
            }
        }

        if (dist < (this.size / 2) + 2) {
            alert("Você foi alcançado por um inimigo. Fim de jogo.");
            location.reload();
        }
    }

    if (this.touchingLines <= 0) {
        if (this.type == 'echo' && (now - this.lastDetection) >= this.detectionCoolDown) {
            this.chasing = false;
            this.visible = false;
        }
        else if (this.type == 'radar' && !player.isRunning && !player.isWalk && (now - this.lastDetection) >= this.detectionCoolDown) {
            this.chasing = false;
            this.visible = false;
        }
    }    
  }

  // Desenha um círculo ondulado
  drawWavyCircle(ctx, radius, speed, color, rotationOffset, time) {
    ctx.beginPath();
    const ctxX = this.x - camera.x;
    const ctxY = this.y;

    for (let i = 0; i <= 360; i += 5) {
      const angle = (i * Math.PI / 180);
      const wave = Math.sin(angle * this.waveCount + time * speed + rotationOffset) * this.waveAmplitude;
      const r = radius + wave;
      const x = ctxX + Math.cos(angle) * r;
      const y = ctxY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Desenha o inimigo
  // Se for um inimigo do tipo radar, desenha o efeito de circulos ondulados
  draw(ctx) {
    if (this.type == 'radar' && this.visible) {
        const circle1Radius = this.size;
        const circle2Radius = this.size + 5;
        const now = Date.now();

        this.drawWavyCircle(ctx, circle1Radius, 0.002, "rgba(255, 0, 0, 0.5)", 0, now);
        this.drawWavyCircle(ctx, circle2Radius, -0.0015, "rgba(255, 50, 50, 0.3)", Math.PI / 2, now);
    }
  }
}