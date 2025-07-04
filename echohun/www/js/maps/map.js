class Map {
  level = 0;
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

  generateNavGrid = (cellSize = 16, radius = 10) => {
    const cols = Math.ceil(this.width / cellSize);
    const rows = Math.ceil(this.height / cellSize);
    const navGrid = [];

    for (let y = 0; y < rows; y++) {
      navGrid[y] = [];
      for (let x = 0; x < cols; x++) {
        // Calcula o centro da célula
        const cx = x * cellSize + cellSize / 2;
        const cy = y * cellSize + cellSize / 2;

        // Verifica se o centro está dentro de alguma parede
        let blocked = false;
        if (isWallColliding(cx, cy, radius)) {
          blocked = true; 
        }

        navGrid[y][x] = blocked ? 1 : 0;
      }
    }
    return navGrid;
  };

  Load() {
    console.log(`Carregando mapa: ${this.name}`);
    this.generateNavGrid(config.CELL_SIZE);      
    for (const enemy of this.enemies) {
      console.log(` |-> Carregando inimigo: ${enemy.name}`);      
      enemy.navGrid = this.generateNavGrid(config.CELL_SIZE, enemy.radius / 4);
    }
    console.log(` |-> Carregando player`);
    game.player.navGrid = this.generateNavGrid(config.CELL_SIZE, game.player.radius);
    this.mapStarted = true;
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
    if (config.DEBUG) { config.WALL_COLOR = "rgb(100, 100, 100)"; }
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
