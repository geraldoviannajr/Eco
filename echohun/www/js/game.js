class Game {
  canvas = null;      
  ctx = null;
  map = null;
  player = null;
  lines = [];
  camera = { x: 0, y: 0 };
  keys = {};
  keyPressTimes = {};
  mouseTarget = null;  
  mousePos = null;  
  isMousePressed = false;
  mousePressStart = 0;
  lastClapTime = 0;
  isPaused = false;
  idTouchPlayerMove = -1; // Idetificador do toque que move o jogador, -1 significa nenhum toque ativo

  constructor(w, h) {
    this.lines = [];
    this.camera = { x: 0, y: 0 };
    this.keys = {};
    this.keyPressTimes = {};
    this.mouseTarget = null;
    this.isMousePressed = false;
    this.mousePressStart = 0;
    this.lastClapTime = 0;

    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    if (h > w) {
      this.canvas.width = h;
      this.canvas.height = w;
    } else {
      this.canvas.width = w;
      this.canvas.height = h;
    }
        
    this.ctx.scale(1, 1);
    //this.ctx.imageSmoothingEnabled = false; // Desativa o suavizado de imagem para evitar borrões

    this.player = new Player(0, 0); // Cria o jogador na posição inicial (0, 0);
  }

  pause = () => {
    this.isPaused = true;
  }

  resume = () => {
    this.isPaused = false;
  }

  MoveTowardMouse = (stepdistance) => {
    if (!this.mouseTarget) return;

    const dx = this.mouseTarget.x - this.player.x;
    const dy = this.mouseTarget.y - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < stepdistance) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const nextX = this.player.x + nx * stepdistance;
    const nextY = this.player.y + ny * stepdistance;

    if (!isWallColliding(nextX, this.player.y)) this.player.x = nextX;
    if (!isWallColliding(this.player.x, nextY)) this.player.y = nextY;
  };

  HandleMovement = () => {
    const now = Date.now();
    const millisecondsDifference = now - this.player.lastEcho;

    let maxHeld = 0;
    let isRunning = false;

    if (this.isMousePressed) {
      if (
        !this.player.wasIdle &&
        now - this.mousePressStart > config.RUN_THRESHOLD
      )
        isRunning = true;
    } else {
      for (const key in this.keyPressTimes) {
        const held = now - this.keyPressTimes[key];
        if (held > maxHeld) maxHeld = held;
        if (held > config.RUN_THRESHOLD && !this.player.wasIdle)
          isRunning = true;
      }
    }

    this.player.speed = isRunning ? config.RUN_SPEED : config.WALK_SPEED;

    const prevX = this.player.x;
    const prevY = this.player.y;
    const stepdistance = isRunning ? config.RUN_STEP : config.WALK_STEP;

    let moved = false;

    if (this.isMousePressed) this.MoveTowardMouse(stepdistance);
    else {
      if (this.keys["d"] || this.keys["D"]) {
        const tryX = this.player.x + stepdistance;
        if (!isWallColliding(tryX, this.player.y)) this.player.x = tryX;
      }
      if (this.keys["a"] || this.keys["A"]) {
        const tryX = this.player.x - stepdistance;
        if (!isWallColliding(tryX, this.player.y)) this.player.x = tryX;
      }
      if (this.keys["w"] || this.keys["W"]) {
        const tryY = this.player.y - stepdistance;
        if (!isWallColliding(this.player.x, tryY)) this.player.y = tryY;
      }
      if (this.keys["s"] || this.keys["S"]) {
        const tryY = this.player.y + stepdistance;
        if (!isWallColliding(this.player.x, tryY)) this.player.y = tryY;
      }
      /*const dx = Math.abs(this.player.x - this.player.lastStepX);
      const dy = Math.abs(this.player.y - this.player.lastStepY);    */
    }
    moved = this.player.x !== prevX || this.player.y !== prevY;

    if (moved) {
      if (
        millisecondsDifference >= this.player.speed ||
        this.player.forceNextStep
      ) {
        this.player.lastEcho = now;
        this.player.forceNextStep = false;
        emitEcho(this.player.x, this.player.y, isRunning ? "run" : "walk");
        playStepSound(isRunning);
      }
      this.player.lastStepX = this.player.x;
      this.player.lastStepY = this.player.y;
    }

    this.player.wasIdle =
      !moved && Object.keys(this.keys).length === 0 && !this.isMousePressed;
    this.player.isRunning = !this.player.wasIdle && isRunning;
    this.player.isWalk = !this.player.wasIdle;

    // Centraliza a câmera no jogador
    const centerStartX = this.canvas.width / 2;
    const centerStartY = this.canvas.height / 2;

    const centerEndX = this.map.width - this.canvas.width / 2;
    const centerEndY = this.map.height - this.canvas.height / 2;

    if (this.player.x < centerStartX) {
      this.camera.x = 0;
    } else if (this.player.x > centerEndX) {
      this.camera.x = this.map.width - this.canvas.width;
    } else {
      this.camera.x = this.player.x - this.canvas.width / 2;
    }

    if (this.player.y < centerStartY) {
      this.camera.y = 0;
    } else if (this.player.y > centerEndY) {
      this.camera.y = this.map.height - this.canvas.height;
    } else {
      this.camera.y = this.player.y - this.canvas.height / 2;
    }

    // Verifica se o jogador está colidindo com a porta de saída
    if (
      this.player.x >= this.map.exitDoor.x &&
      this.player.x <= this.map.exitDoor.x + this.map.exitDoor.width &&
      this.player.y >= this.map.exitDoor.y &&
      this.player.y <= this.map.exitDoor.y + this.map.exitDoor.height
    ) {
      this.map.Exit();
    }
  };

  EmitClap = () => {
    const now = Date.now();
    if (now - this.lastClapTime >= config.CLAP_COOLDOWN) {
      this.lastClapTime = now;
      emitEcho(this.player.x, this.player.y, "clap");
      playClapSound();
    }
  }

  AddEvents = () => {
    // === EVENTOS ===
    window.addEventListener("keydown", (e) => {
      if (!(e.key in this.keys)) {
        this.keyPressTimes[e.key] = Date.now();
      }
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      delete this.keys[e.key];
      delete this.keyPressTimes[e.key];

      // Se todas as teclas de movimento foram soltas
      if (
        !this.keys["w"] &&
        !this.keys["a"] &&
        !this.keys["s"] &&
        !this.keys["d"] &&
        !this.keys["W"] &&
        !this.keys["A"] &&
        !this.keys["S"] &&
        !this.keys["D"]
      ) {
        this.player.wasIdle = true;
        this.player.forceNextStep = true;
      }

      //Se apertou "space"
      if (e.code === "Space") {
        this.EmitClap();
      }
    });

    if (device.platform == "browser") {
      this.canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mouseX = ((e.clientX - rect.left) * scaleX) + this.camera.x;
        const mouseY = ((e.clientY - rect.top) * scaleY) + this.camera.y;
        this.mouseTarget = { x: mouseX, y: mouseY };
        this.isMousePressed = true;
        this.mousePressStart = Date.now();
        //if (audioContext.state === "suspended") { audioContext.resume(); }
      });

      this.canvas.addEventListener("mouseup", (e) => {
        e.preventDefault();
        this.isMousePressed = false;
        this.mouseTarget = null;
        this.player.wasIdle = true;
        this.player.forceNextStep = true;
      });

      this.canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mouseX = ((e.clientX - rect.left) * scaleX) + this.camera.x;
        const mouseY = ((e.clientY - rect.top) * scaleY) + this.camera.y;

        if (this.isMousePressed) {
          this.mouseTarget = { x: mouseX, y: mouseY };
        }
        else {
          this.mousePos = { x: mouseX, y: mouseY };
        }
      });
    } else {
      this.canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        // Se houver dois toques, dispara o clap
        if (e.touches.length == 2)  {
          this.EmitClap();
        }
        // Se houver apenas um toque, armazena o ID do toque para o movimento do player 
        else if (e.touches.length == 1) {
          const touch = e.touches[e.touches.length - 1]; // Armazena o índice do último toque
          this.idTouchPlayerMove = touch.identifier; // Armazena o ID do toque que move o jogador

          const rect = this.canvas.getBoundingClientRect();        
          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;
          const mouseX = ((touch.clientX - rect.left) * scaleX) + this.camera.x;
          const mouseY = ((touch.clientY - rect.top) * scaleY) + this.camera.y;
          this.mouseTarget = { x: mouseX, y: mouseY };
          this.isMousePressed = true;
          this.mousePressStart = Date.now();
        }

      });

      this.canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (this.idTouchPlayerMove >= 0) {
          // Verifica se o toque que está sendo liberado é o que move o jogador
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.idTouchPlayerMove) {
              this.isMousePressed = false;
              this.mouseTarget = null;
              this.player.wasIdle = true;
              this.player.forceNextStep = true;
              this.idTouchPlayerMove = -1; // Reseta o ID do toque
              break;
            }
          }          
        }
      });

      this.canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (this.isMousePressed && this.idTouchPlayerMove >= 0) {
          // Verifica se o toque que está se movendo é o que move o jogador
          for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            if (touch.identifier === this.idTouchPlayerMove) {
              const rect = this.canvas.getBoundingClientRect();
              const scaleX = this.canvas.width / rect.width;
              const scaleY = this.canvas.height / rect.height;
              const mouseX = ((touch.clientX - rect.left) * scaleX) + this.camera.x;
              const mouseY = ((touch.clientY - rect.top) * scaleY) + this.camera.y;
              this.mouseTarget = { x: mouseX, y: mouseY };
              break;
            }
          }
        }
      });
    }
  };

  DrawBackground = () => {
    this.ctx.fillStyle = "rgb(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Draw = () => {
    this.DrawBackground();
    this.map.Draw();
  };

  DrawGameOver = () => {
    this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const message = "** YOU DIED **";
    this.ctx.save();
    this.ctx.font = "48px Horrorfind-gp0Y";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;
    //const textWidth = this.ctx.measureText(message).width;
    //const padding = 40;

    this.ctx.fillStyle = "white";
    this.ctx.fillText(message, centerX, centerY);
    this.ctx.restore();
  };

  DrawPause = () => {
    this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const message = "## PAUSED ##";
    this.ctx.save();
    this.ctx.font = "48px Horrorfind-gp0Y";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;

    this.ctx.fillStyle = "white";
    this.ctx.fillText(message, centerX, centerY);
    this.ctx.restore();
  };

  DrawMapWin = () => {
    this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const message = "** YOU WIN **";
    this.ctx.save();
    this.ctx.font = "48px Horrorfind-gp0Y";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;
    //const textWidth = this.ctx.measureText(message).width;
    //const padding = 40;

    this.ctx.fillStyle = "white";
    this.ctx.fillText(message, centerX, centerY);
    this.ctx.restore();
  };

  DrawInfo = () => {    
    const message = 
    /*"Dim.: (" + this.canvas.width + " x " + this.canvas.height + ")" +    
    " | Player: (" + Math.round(this.player.x) + ", " + Math.round(this.player.y) + ")" +
    " | Camera: (" + Math.round(this.camera.x) + ", " + Math.round(this.camera.y) + ")" +
    (this.mouseTarget ? `" | Touch: (${Math.round(this.mouseTarget.x)}, ${Math.round(this.mouseTarget.y)})` : "")
    ;*/

    " Player: (" + Math.round(this.player.x) + ", " + Math.round(this.player.y) + ")" +
    " Enemy[1]: (" + Math.round(this.map.enemies[0].x) + ", " + Math.round(this.map.enemies[0].y) + ", " + this.map.enemies[0].radius + ")" +
    " Enemy[2]: (" + Math.round(this.map.enemies[1].x) + ", " + Math.round(this.map.enemies[1].y) + ", " + this.map.enemies[1].radius + ")" +
    " Mouse: (" + (this.mousePos ? Math.round(this.mousePos.x) : "N/A") + ", " + (this.mousePos ? Math.round(this.mousePos.y) : "N/A")
    ;

    this.ctx.save();
    this.ctx.font = "8px arial,sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    this.ctx.fillStyle = "white";
    this.ctx.fillText(message, 10, this.canvas.height - 20);
    this.ctx.restore();
  };


  UpdateLines = () => {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const line = this.lines[i];
      line.update();
      line.draw();
      if (line.isDead()) {
        if (line.doorTouched == true && this.map.exitDoor.touchingLines > 0) {
          this.map.exitDoor.touchingLines--;
        }
        if (
          line.enemy == null &&
          line.enemiesTouched != undefined &&
          line.enemiesTouched != null &&
          line.enemiesTouched.length > 0
        ) {
          for (const enemy of line.enemiesTouched) {
            if (enemy.touchingLines > 0) {
              enemy.touchingLines--;
            }
            if (enemy.touchingLines <= 0) {
              enemy.touchingLines = 0;
              enemy.lastDetection = Date.now();
            }
          }
        }
        this.lines.splice(i, 1);
      }
    }
    this.map.exitDoor.visible = this.map.exitDoor.touchingLines > 0;
  };

  Update = () => {        
    if (this.isPaused) {
      this.DrawPause();
    } else {
      this.map.Update();
      this.UpdateLines();
      this.DrawInfo();
    }

    if (this.player.isDead == true) {
      this.DrawGameOver();
    } else if (this.map.mapStarted == false) {
      this.DrawMapWin();
    }
  };

  Animate = () => {
    this.Draw();

    if (this.map.mapStarted && !this.player.isDead && !this.isPaused) {
      this.HandleMovement();
    }

    this.Update();
    requestAnimationFrame(this.Animate);
  };
}
