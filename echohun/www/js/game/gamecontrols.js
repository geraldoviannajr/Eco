const GameControls = (Base) =>
  class extends Base {
    drawControls() {
      for (const control of this.controls) {
        control.draw();
      }
    }

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
  };
