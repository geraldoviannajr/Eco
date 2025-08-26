class PauseScreen extends GameScreen {
  draw(ctx) {
    this.loaded = true;
    this.alpha = 1;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const message = window.game.language.getResource('paused');
    ctx.save();
    ctx.font = "150px Horrorfind-gp0Y";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2 - 30;

    ctx.fillStyle = "rgba(255, 0, 0, " + this.alpha + ")";
    ctx.fillText(message, centerX, centerY);

    ctx.font = "24px Arial";
    ctx.fillStyle = "rgba(255, 0, 0, " + this.alpha + ")";
    ctx.fillText(window.game.language.getResource('clickToReturn'), centerX, centerY + 90);
    ctx.restore();
  }

  doEvent(eventName, e) {
    var game = window.game;
    if (!this.loaded) 
      return;

    switch (eventName) {
      case "touchstart":
      case "mousedown":
        console.log("Voltando ao Gameplay...");
        game.screen = this.screens.gameplay;
        break;
    }
  }
}
