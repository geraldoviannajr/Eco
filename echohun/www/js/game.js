class Game {
  canvas = null;      
  ctx = null;
  map = null;
  player = null;
  lines = [];
  camera = new Camera();
  keys = {};
  keyPressTimes = {};
  mouseTarget = null;  
  mousePos = null;  
  isMousePressed = false;
  mousePressStart = 0;
  isPaused = false;
  idTouchPlayerMove = -1; // Idetificador do toque que move o jogador, -1 significa nenhum toque ativo
  controls = [];
  fps = 0; // Frames per second  
  gameTime = 0; // Tempo de jogo em segundos
  gameState = 'inactive'; //
  deltaTime = 0; // valor inicial em ms
  _framesThisSecond = 0;
  _lastFpsUpdate = performance.now();
  _lastFrameTime = performance.now();

  constructor(w, h) {    
    this.lines = [];
    this.keys = {};
    this.keyPressTimes = {};
    this.mouseTarget = null;
    this.isMousePressed = false;
    this.mousePressStart = 0;
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this._flashTime = 0;

    if (h > w) {
      this.canvas.width = h;
      this.canvas.height = w;
    } else {
      this.canvas.width = w;
      this.canvas.height = h;
    }
       
    this.ctx.scale(1, 1);
    //this.ctx.imageSmoothingEnabled = false; // Desativa o suavizado de imagem para evitar borrões  

    console.log('|-> Criando jogador...');
    this.player = new Player(0, 0); // Cria o jogador na posição inicial (0, 0);

    console.log('|-> Criando sons...');
    this.sounds = new Sounds();
       
    if (window.HeadsetDetection && device.platform != 'browser') {
      console.log(' |-> 🎵 Adicionando eventos de áudio');
      window.HeadsetDetection.detect(function(detected) { window.game.sounds.setHeadphoneMode(detected); });
      window.HeadsetDetection.registerRemoteEvents(function(status) {
        switch (status) {
            case 'headsetAdded':
              window.game.sounds.setHeadphoneMode(true);
              break;
            case 'headsetRemoved':
              window.game.sounds.setHeadphoneMode(false);
              break;
        };
      });
    }
  
    console.log('|-> Criando HUD...');
    this.hud = new HUD();

    console.log('|-> Adicionando controles...');
    this.controls.push(this.hud);

    console.log('|-> Criando radar...');
    this.controls.push(new Radar());
  }

  pause() {
    this.isPaused = true;
    this.sounds.pauseAll();
  }

  resume() {
    this.isPaused = false;
    this.sounds.resumeAll();
  }

  emitClap() {
    if (this.player.stamina >= config.MIN_STAMINA_CLAP && !this.player.isDead && !this.isPaused) {
      this.player.emitEcho("clap");
      this.player.stamina = 0; // Custa todas as staminas
    }
  }

  checkControls (x, y, doClick = false) {
    var mouseX = x;
    var mouseY = y;    
    if (device.platform != "browser" || config.FORCE_TOUCH) // Eventos do Touchscreen (mobile)
    {      
      const rect = this.canvas.getBoundingClientRect();        
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      mouseX = ((x - rect.left) * scaleX); //+ this.camera.x;
      mouseY = ((y - rect.top) * scaleY); //+ this.camera.y;  
    }

    if (config.DEBUG_INFO)
      console.log(' |-> 👆 Checando controles: {' + x + ',' + y + '}, {' + mouseX + ',' + mouseY + '}, ' +  doClick);

    for (const control of this.controls) {
      if (control.visible && pointInCircle(mouseX, mouseY, control)) {
        if (doClick == true) { control.click(); }
        return true;
      }
    }
    return false;
  }

  addEvents() {
    // === EVENTOS ===
    window.addEventListener("keydown", (e) => {
      if (!(e.key in this.keys)) {
        this.keyPressTimes[e.key] = this.gameTime;
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
      ) { this.player.wasIdle = true; }
      else { this.player.forceNextStep = true; }

      //Se apertou "space"
      if (e.code === "Space") { this.emitClap(); }
    });

    if (device.platform == "browser" && !config.FORCE_TOUCH) // Eventos do Mouse (desktop)
    {
      this.canvas.addEventListener("mousedown", (e) => {        
        e.preventDefault();
        if (this.isPaused) { return; }
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mouseX = ((e.clientX - rect.left) * scaleX);
        const mouseY = ((e.clientY - rect.top) * scaleY);
        if (!this.checkControls(mouseX, mouseY, false)) {
          this.mouseTarget = { x: mouseX + this.camera.x, y: mouseY + this.camera.y };
          this.mousePos = { x: mouseX, y: mouseY };
          this.isMousePressed = true;
          this.mousePressStart = this.gameTime;
        }
      });

      this.canvas.addEventListener("mouseup", (e) => {
        e.preventDefault();
        if (this.isPaused) { this.resume(); return; }
        if (this.player.isDead) return;
        else if (this.checkControls(this.mousePos.x, this.mousePos.y, true)) return;
        else if (!this.player.wasIdle) 
        {
          this.isMousePressed = false;
          this.mouseTarget = null;
          this.player.wasIdle = true;
          this.player.forceNextStep = true;
        }
      });

      this.canvas.addEventListener("mousemove", (e) => {
        e.preventDefault();
        if (this.isPaused) { return; }
        if (this.player.isDead) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mouseX = ((e.clientX - rect.left) * scaleX);
        const mouseY = ((e.clientY - rect.top) * scaleY);

        if (this.isMousePressed) {
          this.mouseTarget = { x: mouseX + this.camera.x, y: mouseY + this.camera.y };
        }
        else {
          this.mousePos = { x: mouseX, y: mouseY};
        }
      });
    } 
    else  // Eventos do Touchscreen (mobile)
    {
      this.canvas.addEventListener("touchstart", (e) => {        
        e.preventDefault();
        if (this.isPaused) { return; }
        if (this.player.isDead) return;

        const touch = e.touches[e.touches.length - 1]; // Armazena o índice do último toque

        if (config.DEBUG_INFO)
          console.log('👆 Evento "TouchStart" detectado: ', touch);
        
        // Verifica se tocou num controle
        if (this.checkControls(touch.clientX, touch.clientY, false)) 
          return;
        
        if (e.touches.length == 2)  { 
          // Se houver dois toques, dispara o clap
          this.emitClap(); 
        } else if (e.touches.length == 1) { 
          // Se houver apenas um toque, armazena o ID do toque para o movimento do player 
          if (config.DEBUG_INFO)
            console.log(' |-> Armazenando ID do toque que move o jogador e iniciando movimento...');

          this.idTouchPlayerMove = touch.identifier; // Armazena o ID do toque que move o jogador
          const rect = this.canvas.getBoundingClientRect();        
          const scaleX = this.canvas.width / rect.width;
          const scaleY = this.canvas.height / rect.height;
          const mouseX = ((touch.clientX - rect.left) * scaleX) + this.camera.x;
          const mouseY = ((touch.clientY - rect.top) * scaleY) + this.camera.y;
          this.mouseTarget = { x: mouseX, y: mouseY };
          this.isMousePressed = true;
          this.mousePressStart = this.gameTime;
        }

      });

      this.canvas.addEventListener("touchend", (e) => {
        e.preventDefault();        
        if (this.isPaused) { this.resume(); return; }
        
        if (config.DEBUG_INFO)
          console.log('👆 Evento "TouchEnd" detectado: ', e.changedTouches);

        var isMove = false;

        // Executa todos os eventos de liberação
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          
          // Verifica se o toque que está sendo liberado é o que move o jogador
          if (this.idTouchPlayerMove >= 0 && touch.identifier === this.idTouchPlayerMove) {
            if (config.DEBUG_INFO)
              console.log(' |-> Liberando toque do jogador...');
            
            isMove = true;
            this.isMousePressed = false;
            this.mouseTarget = null;
            this.player.wasIdle = true;
            this.player.forceNextStep = true;
            this.idTouchPlayerMove = -1; // Reseta o ID do toque
          }
          else 
          {
            this.checkControls(touch.clientX, touch.clientY, true);
          }
        }          

      });

      this.canvas.addEventListener("touchcancel", (e) => {
        // e.preventDefault();
        if (config.DEBUG_INFO)
          console.log('👆 Evento "TouchCancel" detectado: ', e.changedTouches);

        if (this.idTouchPlayerMove >= 0) {
          // Verifica se o toque que está sendo cancelado é o que move o jogador
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.idTouchPlayerMove) {
              if (config.DEBUG_INFO)
                console.log(' |-> Cancelando toque do jogador...');

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
        //if (this.isPaused) { this.resume(); return; }
        if (this.player.isDead) return;

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

  drawBackground() {
    this.ctx.fillStyle = "rgb(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };
  
  drawGameOver() {
    this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const message = "YOU DIED";
    this.ctx.save();
    this.ctx.font = "62px Horrorfind-gp0Y";
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

  drawPause() {
    this.player.bag.drawInventory(this.ctx);
  };

  drawMapWin() {
    this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const message = "YOU WIN";
    this.ctx.save();
    this.ctx.font = "62px Horrorfind-gp0Y";
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

  drawControls() {
    for (const control of this.controls) {
      control.draw();
    }
  }

  drawInfo() {        
    const msg = 
        "FPS: " + this.fps +
        " | Dim.: (" + this.canvas.width + " x " + this.canvas.height + ")" +    
        " | Player: (" + Math.round(this.player.x) + ", " + Math.round(this.player.y) + ")" +
        " | Camera: (" + Math.round(this.camera.x) + ", " + Math.round(this.camera.y) + ")" +
        " | Mouse: (" + (this.mousePos ? Math.round(this.mousePos.x) : "N/A") + ", " + (this.mousePos ? Math.round(this.mousePos.y) : "N/A") + ")" +
        " | Target: (" + (this.mouseTarget ? Math.round(this.mouseTarget.x) : "N/A") + ", " + (this.mouseTarget ? Math.round(this.mouseTarget.y) : "N/A") + ")" +
        " | Headphone: " + (this.sounds.isHeadphone ? "ON" : "OFF") +
        " | 3D: " + (this.sounds.is3D ? "ON" : "OFF"); 
    
    this.ctx.save();    
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = "white";
    this.ctx.font = "10px Courier New, monospace";
    this.ctx.fillText(msg, 10, this.canvas.height - 20);
    this.ctx.restore();
  };

  updateLines() {
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
              enemy.lastDetection = this.gameTime;
            }
          }
        }
        this.lines.splice(i, 1);
      }
    }
    this.map.exitDoor.visible = this.map.exitDoor.touchingLines > 0;
  };
  
  checkCollisions() {
    for (let i = 0; i < this.map.objects.length; i++) {
      for (let j = i + 1; j < this.map.objects.length; j++) {
        const obj1 = this.map.objects[i];
        const obj2 = this.map.objects[j];
        
        if (obj1.checkCollision(obj2)) {
          obj1.onCollision(obj2);
          obj2.onCollision(obj1);
        }
      }
    }    
  };
  
  update() {
    if (this._flashTime > 0) {
      this._flashTime -= this._deltaTime;
      this.ctx.save();
      this.ctx.globalAlpha = 0.25 + 0.25 * Math.random();
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }    

    this.map.update();
    this.updateLines();      
    this.camera.update();
    this.checkCollisions();
  };

  static init() {      
    document.getElementById('gameCanvas').style.display = 'none';  
    document.getElementById('start_screen').style.display = 'flex';

    var btnClick = () => {
      // Criar um efeito de fade-out
      let opacity = 100;
      const fadeOut = setInterval(() => { 
        opacity -= 1; 
        if (opacity <= -10) { 
          clearInterval(fadeOut); 
          document.getElementById('gameCanvas').style.display = 'block';  
          document.getElementById('start_screen').style.display = 'none';

          console.log('Criando jogo...');
          window.game = new Game(config.GAME_SCREEN_WIDTH, config.GAME_SCREEN_HEIGHT, 1);   

          console.log('Adicionando eventos principais...');
          window.addEventListener("resize", resizeCanvas);
          document.addEventListener("pause",() => {window.game.pause();},false);
         
          console.log('Ajustando tamanho da tela...');
          resizeCanvas();
        
          console.log(' |-> Criando idioma...');
          window.game.language = new Language('pt_br');        
        
          console.log(' |-> Iniciando jogo...');        
          window.game.start();
          return; 
        }            
        if (opacity > 1) 
          document.getElementById('start_screen').style.opacity = opacity + '%';
      }, 50);
    };

    document.getElementById('start_btn').addEventListener('click', btnClick);
    document.getElementById('start_btn').addEventListener('touchstart', btnClick);  
  }

  start() {
    this.gameState = 'started';
    console.log('Criando mapa...');
    window.game.map = new Map1();
  
    console.log('Carregando mapa...');
    window.game.map.load();
  
    console.log('Adicionando eventos...');
    window.game.addEvents();  

    console.log(' |-> Iniciando animação...');
    this.animate();
  }
   
  // Precisa ser uma função arrow para ser passada como callback do requestAnimationFrame
  animate = () => {
    const now = performance.now();
    this.deltaTime = now - this._lastFrameTime; // em milissegundos
    this._lastFrameTime = now;

    // FPS counter
    this._framesThisSecond++;
    if (now - this._lastFpsUpdate >= 1000) {
      this.fps = this._framesThisSecond;
      this._framesThisSecond = 0;
      this._lastFpsUpdate = now;
    }

    this.drawBackground();
    
    if (this.map != null) {
      this.map.draw(); 
      this.drawControls();
    }    
        
    if (this.isPaused) {
      this.drawPause();
    } else if (this.player.isDead == true) {
      this.drawGameOver();
    } else if (this.map.mapStarted == false) {
      this.drawMapWin();
    } else if (this.map.mapStarted && !this.player.isDead && !this.isPaused) {
      this.update();      
    }
  
    if (config.DEBUG || config.DEBUG_INFO) { 
      this.drawInfo(); 
    }

    if (!this.isPaused) {
      this.gameTime += this.deltaTime;
    }
    
    requestAnimationFrame(this.animate);
  };
}
