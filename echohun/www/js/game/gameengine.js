const GameEngine = (Base) =>
  class extends Base {
    pause() {
      this.isPaused = true;
      this.sounds.pauseAll();
    }

    resume() {
      this.isPaused = false;
      this.sounds.resumeAll();
    }

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
    }

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
    }

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
    }

    start() {
      this.gameState = "started";

      console.log(" |-> Adicionando eventos do jogo...");
      this.addEvents();

      console.log(" |-> Iniciando animação...");
      this.animate();
    }

    // Precisa ser uma função arrow para ser passada como callback do requestAnimationFrame
    animate = () => {
      // Fundo preto
      this.drawBackground();

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

      if (this.player.isDead == true) this.screen = this.screens.gameover;

      if (this.isPaused) this.screen = this.screens.pause;

      if (this.screen != null) {
        this.screen.draw(this.ctx);

        if (!this.isPaused) this.gameTime += this.deltaTime;

        requestAnimationFrame(this.animate);
      }
    };
  };
