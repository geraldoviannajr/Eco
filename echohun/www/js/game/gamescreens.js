const GameScreens = (Base) =>
  class extends Base {
    drawBackground() {
      this.ctx.fillStyle = "rgb(0, 0, 0)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawInit() {
      this.ctx.fillStyle = "rgb(0, 0, 0)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const message = "ECHO HUNTERS";
      this.ctx.save();
      this.ctx.font = "150px Horrorfind-gp0Y";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      const centerX = (this.ctx.canvas.width / 2);
      const centerY = (this.ctx.canvas.height / 2) - 30;

      this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      this.ctx.fillText(message, centerX, centerY);

      this.ctx.font = "24px Arial";
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      this.ctx.fillText("Toque para iniciar", centerX, centerY+90);
      this.ctx.restore();
    }
    
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
    }

    drawPause() {
      this.player.bag.drawInventory(this.ctx);
    }

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
    }
  };
