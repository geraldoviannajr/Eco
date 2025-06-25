class Enemy {
  x = 0;
  y = 0;
  type = "echo"; // Tipo do inimigo, pode ser 'echo' ou 'radar'
  waveCount = 90; // Contagem de ondas para o efeito de radar
  waveAmplitude = 2; // Amplitude da onda para o efeito de radar
  size = 20; // Tamanho do inimigo
  speed = 0.4; // Velocidade de movimento do inimigo
  miliSecBetweenEchos = 1000; // Intervalo entre os ecos
  chasing = false; // Indica se o inimigo está perseguindo o jogador
  visible = false; // Indica se o inimigo está visível
  touchingLines = 0; // Contador de linhas tocadas pelo inimigo
  detectionCoolDown = 3000; // Tempo de recarga para detecção
  lastDetection = Date.now(); // Última vez que o inimigo detectou o jogador
  bodyColor = `rgba(0,0,0,1)`; // Cor do corpo do inimigo
  echoColor = [255, 0, 0, 0.8]; // Cor do eco do inimigo
  expansionSpeed = 4; // Velocidade de expansão do eco
  duration = 1300; // Duração do eco
  lineCount = 24; // Número de linhas no efeito de eco
  lastEcho = Date.now(); // Último eco emitido pelo inimigo
  forceNextStep = false; // Força o próximo passo do inimigo, usado para testes

  // Construtor da classe Enemy
  // Recebe as coordenadas x e y, tipo, tamanho e velocidade do inimigo
  constructor(x, y, type = "echo", size = 20, speed = 0.2) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;
    this.speed = 0.2;
  }

  // Verifica se o inimigo está colidindo com uma linha ou se está se movimentando
  update() {
    const now = Date.now();

    if (this.chasing) {
      const millisecondsDifference = now - this.lastEcho;
      const prevX = this.x;
      const prevY = this.y;
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.speed) return;
      const nx = dx / dist;
      const ny = dy / dist;
      const nextX = this.x + nx * this.speed;
      const nextY = this.y + ny * this.speed;
      if (!isWallColliding(nextX, this.y, this.size + 10)) this.x = nextX;
      if (!isWallColliding(this.x, nextY, this.size + 10)) this.y = nextY;

      let moved = game.player.x !== prevX || game.player.y !== prevY;

      if (moved) {
        if (
          (this.type == "echo" &&
            millisecondsDifference >= this.miliSecBetweenEchos) ||
          this.forceNextStep
        ) {
          this.lastEcho = now;
          this.forceNextStep = false;
          emitEnemyEcho(this);
          //playStepSound(false);
        }
      }

      // Player alcançado por um inimigo
      if (isPlayerColliding(this.x, this.y, this.size / 2 + 15)) {
        game.player.isDead = true;
      }
    }

    if (this.touchingLines <= 0) {
      if (
        this.type == "echo" &&
        now - this.lastDetection >= this.detectionCoolDown
      ) {
        this.chasing = false;
        this.visible = false;
      } else if (
        this.type == "radar" &&
        !game.player.isRunning &&
        !game.player.isWalk &&
        now - this.lastDetection >= this.detectionCoolDown
      ) {
        this.chasing = false;
        this.visible = false;
      }
    }
  }

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

  // Desenha o inimigo
  // Se for um inimigo do tipo radar, desenha o efeito de circulos ondulados
  draw() {
    if (this.type == "radar" && this.visible) {
      const circle1Radius = this.size;
      const circle2Radius = this.size + 5;
      const now = Date.now();

      this.drawWavyCircle(circle1Radius, 0.002, "rgba(255, 0, 0, 0.5)", 0, now);
      this.drawWavyCircle(
        circle2Radius,
        -0.0015,
        "rgba(255, 50, 50, 0.3)",
        Math.PI / 2,
        now
      );
    }
  }
}
