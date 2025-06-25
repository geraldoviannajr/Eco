class Map {
  name = "";
  title = "";
  description = "";
  width = 0;
  height = 0;
  mapStarted = false;
  walls = [];  
  exitDoor = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
    touchingLines: 0,
  };
  enemies = [];  

  constructor(w, h) {
    this.width = w;
    this.height = h;
  }

  Load() {
    this.mapStarted = true;
    console.log(`Carregando mapa: ${this.name}`);
  }

  Draw() {
    this.DrawWalls();
    this.DrawExitDoor();
    this.DrawEnemies();
  }

  Update() {
    this.UpdateEnemies();
  }

  DrawWalls = () => {
    game.ctx.fillStyle = config.WALL_COLOR;

    for (const wall of this.walls) {
      game.ctx.beginPath();
      const start = wall[0];
      game.ctx.moveTo(start.x - game.camera.x, start.y - game.camera.y);
      for (let i = 1; i < wall.length; i++) {
        game.ctx.lineTo(wall[i].x - game.camera.x, wall[i].y - game.camera.y);
      }
      game.ctx.closePath();
      game.ctx.fill();
    }
  };

  DrawExitDoor = () => {
    if (!this.exitDoor.visible) return;
    game.ctx.fillStyle = config.DOOR_COLOR;
    game.ctx.fillRect(
      this.exitDoor.x - game.camera.x,
      this.exitDoor.y - game.camera.y,
      this.exitDoor.width,
      this.exitDoor.height
    );
  };

  DrawEnemies = () => {
    for (const enemy of this.enemies) {
      enemy.draw();
    }
  };

  UpdateEnemies = () => {
    for (const enemy of this.enemies) {
      enemy.update();
    }
  };

  Exit = () => {
    this.mapStarted = false;
    game.player.isDead = false;
    // Em breve vamos carregar novos mapas
    /* 
      game.map = new Map2('map2', 'Map 2 - Fase 2', 'This is the second map of the game. Navigate through the corridors and avoid enemies.');
      game.map.Load();      
      */
  };
}
