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
  isPaused = false;
  idTouchPlayerMove = -1; // Idetificador do toque que move o jogador, -1 significa nenhum toque ativo
  lastUpdateTime = 0; // Armazena o tempo do último update
  hud = new HUD();
  fps = 0; // Frames per second
   _framesThisSecond = 0;
  _lastFpsUpdate = performance.now();    
  constructor(w, h) {
    this.lines = [];
    this.camera = { x: 0, y: 0 };
    this.keys = {};
    this.keyPressTimes = {};
    this.mouseTarget = null;
    this.isMousePressed = false;
    this.mousePressStart = 0;
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
  HandleCamera = () => {
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
    if (this.player.stamina >= config.MIN_STAMINA_CLAP && !this.player.isDead && !this.isPaused) {
      this.player.emitEcho("clap");
      playClapSound();
      this.player.stamina = 0; // Custa todas as staminas
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
    const msg = 
        "FPS: " + this.fps +
        " | Dim.: (" + this.canvas.width + " x " + this.canvas.height + ")" +    
        " | Player: (" + Math.round(this.player.x) + ", " + Math.round(this.player.y) + ")" +
        " | Camera: (" + Math.round(this.camera.x) + ", " + Math.round(this.camera.y) + ")";
    
      /*
      " Player: (" + Math.round(this.player.x) + ", " + Math.round(this.player.y) + ")" +
      " Enemy[1]: (" + Math.round(this.map.enemies[0].x) + ", " + Math.round(this.map.enemies[0].y) + ", " + this.map.enemies[0].radius + ")" +
      " Enemy[2]: (" + Math.round(this.map.enemies[1].x) + ", " + Math.round(this.map.enemies[1].y) + ", " + this.map.enemies[1].radius + ")" +
      " Mouse: (" + (this.mousePos ? Math.round(this.mousePos.x) : "N/A") + ", " + (this.mousePos ? Math.round(this.mousePos.y) : "N/A") + ")";    
      */

    this.ctx.save();    
    this.hud.draw();

    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";

    this.ctx.fillStyle = "white";
    this.ctx.font = "10px Courier New, monospace";
    this.ctx.fillText(msg, 10, this.canvas.height - 20);
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
    const now = Date.now();

    if (this.isPaused) {
      this.DrawPause();
    } else {
      this.player.update(now);
      this.map.Update();
      this.UpdateLines();      
      this.DrawInfo();
    }

    if (this.player.isDead == true) {
      this.DrawGameOver();
    } else if (this.map.mapStarted == false) {
      this.DrawMapWin();
    }
    
    this.lastUpdateTime = now;
  };
  Animate = () => {
    this.Draw();    

    // FPS calculation
    const now = performance.now();
    this._framesThisSecond++;
    if (now - this._lastFpsUpdate >= 1000) {
      this.fps = this._framesThisSecond;
      this._framesThisSecond = 0;
      this._lastFpsUpdate = now;
    }

    if (this.map.mapStarted && !this.player.isDead && !this.isPaused) {
      this.HandleCamera();
    }

    this.Update();
    requestAnimationFrame(this.Animate);
  };
}
