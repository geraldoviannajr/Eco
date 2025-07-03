class Player {
  x = 0;
  y = 0;
  speed = 0;
  lastStepX = 0;
  lastStepY = 0;
  wasIdle = true;
  forceNextStep = false;
  isRunning = false;
  isWalk = false;
  isDead = false;
  lastEcho = 0;
  hp = 100; // 100 é o máximo de hp
  stamina = 100; // 100 é o máximo de stamina
  staminaRegen = 5; // Regeneração de stamina por segundo
  staminaCost = 10; // Custo de stamina por segundo ao correr
  radius = 8; // Raio de colisão do jogador
  navGrid = []; // Grade de navegação para o jogador

  // Construtor da classe Player
  // Define a posição inicial do jogador, a velocidade de caminhada e outras propriedades iniciais
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = config.WALK_SPEED;
    this.lastStepX = 0;
    this.lastStepY = 0;
    this.wasIdle = true;
    this.forceNextStep = false;
    this.isRunning = false;
    this.isWalk = false;
    this.lastEcho = Date.now();
  }

  MoveTowardMouse = (stepdistance) => {
    if (!game.mouseTarget) return;

    const dx = game.mouseTarget.x - this.x;
    const dy = game.mouseTarget.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < stepdistance) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const nextX = this.x + nx * stepdistance;
    const nextY = this.y + ny * stepdistance;

    if (!isWallColliding(nextX, nextY, this.radius)) { this.x = nextX; this.y = nextY; }
    else {
      if (!isWallColliding(nextX, this.y, this.radius)) this.x = nextX;
      else if (!isWallColliding(this.x, nextY, this.radius)) this.y = nextY;
    }
  };  

  update = () => {   
    const now = Date.now();
    const millisecondsDifference = now - this.lastEcho;

    if (game.lastUpdateTime != 0) {
      if (this.isRunning) {
        this.stamina -= this.staminaCost * ((now - game.lastUpdateTime) / 1000);
      } else {
        this.stamina += this.staminaRegen * ((now - game.lastUpdateTime) / 1000);
      }

      if (this.stamina > config.MAX_STAMINA) {
        this.stamina = config.MAX_STAMINA;
      } else if (this.stamina <= 0) {
        this.stamina = 0;
        this.isRunning = false; // Se a stamina acabar, não pode correr        
      }
    }

    let maxHeld = 0;
    let isRunning = this.isRunning;

    // Verifica se o jogador tem stamina suficiente para começar a correr
    if (!this.isRunning && this.stamina >= config.MIN_STAMINA_RUN) {
      if (game.isMousePressed) {
        if (!this.wasIdle && (now - game.mousePressStart > config.RUN_THRESHOLD)
        )
          isRunning = true;
      } else {
        for (const key in game.keyPressTimes) {
          const held = now - game.keyPressTimes[key];
          if (held > maxHeld) maxHeld = held;
          if (held > config.RUN_THRESHOLD && !this.wasIdle)
            isRunning = true;
        }
      }
    } 

    this.speed = isRunning ? config.RUN_SPEED : config.WALK_SPEED;

    const prevX = this.x;
    const prevY = this.y;
    const stepdistance = isRunning ? config.RUN_STEP : config.WALK_STEP;

    let moved = false;

    if (game.isMousePressed) this.MoveTowardMouse(stepdistance);
    else {
      if (game.keys["d"] || game.keys["D"]) {
        const tryX = this.x + stepdistance;
        if (!isWallColliding(tryX, this.y, this.radius)) this.x = tryX;
      }
      if (game.keys["a"] || game.keys["A"]) {
        const tryX = this.x - stepdistance;
        if (!isWallColliding(tryX, this.y, this.radius)) this.x = tryX;
      }
      if (game.keys["w"] || game.keys["W"]) {
        const tryY = this.y - stepdistance;
        if (!isWallColliding(this.x, tryY, this.radius)) this.y = tryY;
      }
      if (game.keys["s"] || game.keys["S"]) {
        const tryY = this.y + stepdistance;
        if (!isWallColliding(this.x, tryY, this.radius)) this.y = tryY;
      }
      /*const dx = Math.abs(this.x - this.lastStepX);
      const dy = Math.abs(this.y - this.lastStepY);*/
    }
    moved = this.x !== prevX || this.y !== prevY;

    if (moved) {
      if (millisecondsDifference >= this.speed || this.forceNextStep) {
        this.lastEcho = now;
        this.forceNextStep = false;
        this.emitEcho(isRunning ? "run" : "walk");
        playStepSound(isRunning);
      }
      this.lastStepX = this.x;
      this.lastStepY = this.y;
    }

    this.wasIdle = !moved && Object.keys(game.keys).length === 0 && !game.isMousePressed;
    this.isRunning = !this.wasIdle && isRunning;
    this.isWalk = !this.wasIdle;
  }

  emitEcho = (type = "walk") => {
    var lineCount = type == "clap" ? config.CLAP_LINE_COUNT : config.ECHO_LINE_COUNT;
    for (let i = 0; i < lineCount; i++) {
      const angle = ((Math.PI * 2) / lineCount) * i;
          
      if (isWallColliding(this.x, this.y, this.radius)) continue; // Evita eco nascer dentro das paredes
      
      game.lines.push(
        new EchoLine(
          this.x,
          this.y,
          angle,
          type,
          null,
          type == "clap" ? config.CLAP_ECHO_BOUNCES : 3
        )
      );
    }
  }  
}
