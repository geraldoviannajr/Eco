const GameEvents = (Base) =>
  class extends Base {
    doEvent(eventName, e) {
      if (config.DEBUG) { 
        console.log("Evento disparado:" + eventName);
      }

      if (this.screen != null) {
        this.screen.doEvent(eventName, e);
      }
    }

    addEvents() {
      window.addEventListener("keydown", (e) => {
        e.preventDefault();
        this.doEvent("keydown", e);
      });
      window.addEventListener("keyup", (e) => {
        e.preventDefault();
        this.doEvent("keyup", e);
      });

      if (device.platform == "browser" && !config.FORCE_TOUCH) {
        // Eventos do Mouse (desktop)
        this.canvas.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this.doEvent("mousedown", e);
        });
        this.canvas.addEventListener("mouseup", (e) => {
          e.preventDefault();
          this.doEvent("mouseup", e);
        });
        this.canvas.addEventListener("mousemove", (e) => {
          e.preventDefault();
          this.doEvent("mousemove", e);
        });
      } // Eventos do Touchscreen (mobile)
      else {
        this.canvas.addEventListener("touchstart", (e) => {
          e.preventDefault();
          this.doEvent("touchstart", e);
        });
        this.canvas.addEventListener("touchend", (e) => {
          e.preventDefault();
          this.doEvent("touchend", e);
        });
        this.canvas.addEventListener("touchcancel", (e) => {
          e.preventDefault();
          this.doEvent("touchcancel", e);
        });
        this.canvas.addEventListener("touchmove", (e) => {
          e.preventDefault();
          this.doEvent("touchmove", e);
        });
      }
    }
  };
