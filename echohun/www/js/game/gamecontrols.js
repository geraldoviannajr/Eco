const GameControls = (Base) =>
  class extends Base {
    
    checkControls(x, y, doClick = false) {
      var mouseX = x;
      var mouseY = y;
      if (device.platform != "browser" || config.FORCE_TOUCH) {
        // Eventos do Touchscreen (mobile)
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        mouseX = (x - rect.left) * scaleX; //+ this.camera.x;
        mouseY = (y - rect.top) * scaleY; //+ this.camera.y;
      }

      if (config.DEBUG_INFO)
        console.log(
          " |-> 👆 Checando controles: {" +
            x +
            "," +
            y +
            "}, {" +
            mouseX +
            "," +
            mouseY +
            "}, " +
            doClick
        );

      for (const control of this.controls) {
        if (control.visible && pointInCircle(mouseX, mouseY, control)) {
          if (doClick == true) {
            control.click();
          }
          return true;
        }
      }
      return false;
    }

    drawInfo() {
      const msg =
        "FPS: " +
        this.fps +
        " | Dim.: (" +
        this.canvas.width +
        " x " +
        this.canvas.height +
        ")" +
        " | Player: (" +
        Math.round(this.player.x) +
        ", " +
        Math.round(this.player.y) +
        ")" +
        " | Camera: (" +
        Math.round(this.camera.x) +
        ", " +
        Math.round(this.camera.y) +
        ")" +
        " | Mouse: (" +
        (this.mousePos ? Math.round(this.mousePos.x) : "N/A") +
        ", " +
        (this.mousePos ? Math.round(this.mousePos.y) : "N/A") +
        ")" +
        " | Target: (" +
        (this.mouseTarget ? Math.round(this.mouseTarget.x) : "N/A") +
        ", " +
        (this.mouseTarget ? Math.round(this.mouseTarget.y) : "N/A") +
        ")" +
        " | Headphone: " +
        (this.sounds.isHeadphone ? "ON" : "OFF") +
        " | 3D: " +
        (this.sounds.is3D ? "ON" : "OFF");
  
      this.ctx.save();
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.fillStyle = "white";
      this.ctx.font = "10px Courier New, monospace";
      this.ctx.fillText(msg, 10, this.canvas.height - 20);
      this.ctx.restore();
    }
  
  };
