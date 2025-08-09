class Game extends GameScreens(GameEngine(GameEvents(GameControls(GameCore)))) {
  emitClap() {
    if (
      this.player.stamina >= config.MIN_STAMINA_CLAP &&
      !this.player.isDead &&
      !this.isPaused
    ) {
      this.player.emitEcho("clap");
      this.player.stamina = 0; // Custa todas as staminas
    }
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
}
