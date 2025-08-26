class Map {
  level = 0;
  name = "";
  title = "";
  description = "";
  width = 0;
  height = 0;
  mapStarted = false;
  objects = [];
  walls = []; 
  enemies = [];  
  exitDoor = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
    touchingLines: 0,
  };  

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
        if (radius <= 0) { radius = 1; }
        if (isWallColliding(cx, cy, radius)) {
          blocked = true; 
        }

        navGrid[y][x] = blocked ? 1 : 0;
      }
    }
    return navGrid;
  };

  load() {
    console.log(`Carregando mapa: ${this.name}`);
    this.generateNavGrid(config.CELL_SIZE);      
    
    for (const enemy of this.enemies) {
      console.log(` |-> Carregando inimigo: ${enemy.name}`);      
      enemy.navGrid = this.generateNavGrid(config.CELL_SIZE, enemy.radius / 4);
    }

    if (game.player) {
      console.log(` |-> Carregando player`);
      game.player.navGrid = this.generateNavGrid(config.CELL_SIZE, game.player.radius);
      this.objects.push(game.player);
    }

    for (const enemy of this.enemies) {
      this.objects.push(enemy);
    }
    this.mapStarted = true;
  }

  draw() {
    if (config.DEBUG) {
      for (const object of this.objects) {
        object.drawHitbox();
      }
    }

    this.drawWalls();
    this.drawExitDoor();
    this.drawObjects();
  }

  update() {
    // Verifica se o jogador está colidindo com a porta de saída
    if (game.player.x >= this.exitDoor.x &&
        game.player.x <= this.exitDoor.x + this.exitDoor.width &&
        game.player.y >= this.exitDoor.y &&
        game.player.y <= this.exitDoor.y + this.exitDoor.height) {
      this.exit();
    }
    for (const obj of this.objects) {
      obj.update();
    }
  }

  drawWalls = () => {
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

  
  drawExitDoor = () => {    
    if (!this.exitDoor.visible) return;

    const ctx = game.ctx;
    const x = this.exitDoor.x - game.camera.x;
    const y = this.exitDoor.y - game.camera.y;
    const w = this.exitDoor.width;
    const h = this.exitDoor.height;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const time = performance.now() * 0.002;

    ctx.save();

    // Background da porta 
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = "rgba(121, 121, 121, 0.938)";
    ctx.fill();

    /*
    // Porta retangular central brilhante e pulsante
    const pulse = Math.sin(time * 2) * 6;
    ctx.beginPath();
    ctx.rect(x - pulse * 0.5, y - pulse, w + pulse, h + pulse * 2);
    ctx.fillStyle = "rgba(255,255,220,0.92)";
    ctx.shadowColor = "#fffbe8";
    ctx.shadowBlur = 32 + 16 * Math.abs(Math.sin(time));
    ctx.fill();
    */

    /*
    // Arcos translúcidos horizontais e verticais (como "ondas" de luz)
    for (let i = 0; i < 3; i++) {
        const arcOffset = 24 + i * 22 + Math.sin(time * 1.5 + i) * 8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2 + arcOffset, h / 2 + arcOffset, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,220,${0.13 - i * 0.03})`;
        ctx.lineWidth = 10 - i * 2;
        ctx.shadowBlur = 18 - i * 5;
        ctx.stroke();
    }
    */

    // Feixes de luz animados saindo da porta em direção ao player
    const rayCount = 16;
    const playerAngle = Math.atan2(game.player.y - (this.exitDoor.y + h / 2), game.player.x - (this.exitDoor.x + w / 2));
    for (let i = 0; i < rayCount; i++) {
        // Espalha os feixes em torno da direção do player
        const spread = Math.PI / 4;
        const angle = playerAngle + (i - rayCount / 2) * (spread / rayCount) + Math.sin(time * 1.2 + i) * 0.07;
        const rayLen = 120 + Math.sin(time * 2 + i) * 18;
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.08 * Math.sin(time * 2 + i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(angle) * (w / 2 + rayLen),
            cy + Math.sin(angle) * (h / 2 + rayLen)
        );
        ctx.strokeStyle = "#fffbe8";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();
    }

    // Núcleo da porta ainda mais intenso
    ctx.beginPath();
    ctx.rect(x + w * 0.25, y + h * 0.25, w * 0.5, h * 0.5);
    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.restore();
  };
  /*
  drawPortal = () => {    
    if (!this.exitDoor.visible) return;

    const ctx = game.ctx;
    const cx = this.exitDoor.x + this.exitDoor.width / 2 - game.camera.x;
    const cy = this.exitDoor.y + this.exitDoor.height / 2 - game.camera.y;
    const baseRadius = Math.max(this.exitDoor.width, this.exitDoor.height) * 0.45;
    const time = performance.now() * 0.002;

    ctx.save();

    // Pulsação do círculo central
    const pulse = Math.sin(time * 2) * 6;

    // Círculo central brilhante
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius + pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,200,0.85)";
    ctx.shadowColor = "#fffbe8";
    ctx.shadowBlur = 32 + 16 * Math.abs(Math.sin(time));
    ctx.fill();

    // Auras/Arcos translúcidos
    for (let i = 0; i < 3; i++) {
        const auraRadius = baseRadius + 18 + i * 18 + Math.sin(time * 1.5 + i) * 6;
        ctx.beginPath();
        ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,220,${0.18 - i * 0.04})`;
        ctx.lineWidth = 8 - i * 2;
        ctx.shadowBlur = 24 - i * 6;
        ctx.stroke();
    }

    // Raios suaves
    const rayCount = 16;
    for (let i = 0; i < rayCount; i++) {
        const angle = (2 * Math.PI * i) / rayCount + time * 0.5;
        const rayLen = baseRadius * 1.7 + Math.sin(time * 2 + i) * 12;
        ctx.save();
        ctx.globalAlpha = 0.13 + 0.07 * Math.sin(time * 2 + i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(angle) * rayLen,
            cy + Math.sin(angle) * rayLen
        );
        ctx.strokeStyle = "#fffbe8";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
    }

    // Círculo central mais intenso (núcleo)
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 0.45 + pulse * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.restore();
  };
  */

  drawObjects = () => {
    for (const obj of this.objects) {
      obj.draw();
    }
  };

  exit = () => {
    this.mapStarted = false;
    game.player.isDead = false;
    // Em breve vamos carregar novos mapas
    /* 
      game.map = new Map2('map2', 'Map 2 - Fase 2', 'This is the second map of the game. Navigate through the corridors and avoid enemies.');
      game.map.Load();      
      */
  };
}
