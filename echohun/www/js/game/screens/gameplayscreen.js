class GameplayScreen extends GameScreen {
  static draw(ctx, canvas) {
    window.game.update();
    if (config.DEBUG || config.DEBUG_INFO) {
      window.game.drawInfo();
    }    
  }
}
