const GameEvents = (Base) => class extends Base {
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
}