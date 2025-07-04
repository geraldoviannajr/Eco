class Enemy {
  x = 0;
  y = 0;
  name = "Inimigo"; // Nome do inimigo
  type = "echo"; // Tipo do inimigo, pode ser 'echo' ou 'radar'
  createdAt = Date.now(); // Data de criação do inimigo
  waveCount = 90; // Contagem de ondas para o efeito de radar
  waveAmplitude = 2; // Amplitude da onda para o efeito de radar
  radius = 20; // Tamanho do inimigo
  speed = 0.4; // Velocidade de movimento do inimigo
  miliSecBetweenEchos = 1000; // Intervalo entre os ecos
  chasing = false; // Indica se o inimigo está perseguindo o jogador
  visible = false; // Indica se o inimigo está visível
  touchingLines = 0; // Contador de linhas tocadas pelo inimigo
  bodyColor = `rgba(0,0,0,1)`; // Cor do corpo do inimigo
  echoColor = [255, 0, 0, 0.8]; // Cor do eco do inimigo
  expansionSpeed = 4; // Velocidade de expansão do eco
  duration = 1000; // Duração do eco
  lineCount = 24; // Número de linhas no efeito de eco  
  chasingPoint = {x: 0, y : 0}; // Último ponto de perseguição do inimigo
  lastEcho = Date.now(); // Último eco emitido pelo inimigo
  forceNextStep = false; // Força o próximo passo do inimigo, usado para testes
  navGrid = []; // Matriz de navegação do inimigo dentro do mapa, será preenchida pelo mapa no momento do carregamento
  chasingPath = []; // Último caminho calculado pelo inimigo  
  _lastAttack = 0; // Último ataque emitido pelo inimigo

  // Construtor da classe Enemy
  // Recebe as coordenadas x e y, tipo, tamanho e velocidade do inimigo
  constructor(x, y, name = 'Enemy', type = "echo", radius = 20, speed = 0.2) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
    this.radius = radius;
    this.speed = 0.2;
  }

  emitAttack() { 
    this._lastAttack = Date.now();
  }

  emitEcho() {
    for (let i = 0; i < this.lineCount; i++) {
      const angle = ((Math.PI * 2) / this.lineCount) * i;
      
      var x = this.x + Math.cos(angle) * (this.radius);
      var y = this.y + Math.sin(angle) * (this.radius); 
      
      if (isWallColliding(x, y, this.radius)) {
        // Se colidir com parede, ajusta a posição para evitar que o eco nasça dentro da parede
        const wallOffset = 5; // Distância mínima do eco para a parede
        const offsetX = Math.cos(angle) * wallOffset;
        const offsetY = Math.sin(angle) * wallOffset;
        x += offsetX;
        y += offsetY;
        // Verifica novamente se colide com parede após o ajuste
        if (isWallColliding(x, y, this.radius)) {
          continue; // Pula este eco se ainda colidir com parede
        }        
      } 
     
      game.lines.push( new EchoLine(x, y, angle, "enemy", this, 3) );
    }
  }
  // Verifica se o inimigo está colidindo com uma linha ou se está se movimentando
  update() {
    const now = Date.now();

    // Se o inimigo estiver tocando linhas inicia ou atualiza a perseguição
    if (this.chasingPoint.x != 0 && this.chasingPoint.y != 0) 
    {
      this.chasing = true; // Começa a perseguir o jogador, se já não estiver
      this.visible = true; // Torna o inimigo visível
      
      this.chasingPath = findPath(
        convertToCellCoordinates(this.x, this.y),
        convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y),
        this.navGrid
      );        
    } else if (!(this instanceof LittleDarkness)) {
      this.chasing = false; // Se não há ponto de perseguição, para a perseguição
      this.visible = false; // Torna o inimigo invisível
    }

    // Está perseguindo o jogador
    // Se o inimigo estiver perseguindo o jogador, calcula o próximo passo
    if (this.chasing) {
      var moved = false;

      const prevX = this.x;
      const prevY = this.y;
      var nextX = this.x;
      var nextY = this.y;

      const currentCell = convertToCellCoordinates(this.x, this.y);
      var nextCell = currentCell;

      // Se o inimigo tem um caminho de perseguição, pega o próximo nó do caminho
      if (this.chasingPath != null && this.chasingPath.length > 1) {
        nextCell = this.chasingPath[1];
      } else {
        // Não há caminho, tenta mover para a célula vizinha mais próxima do chasingPoint          
        const targetCell = convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y);

        let bestNeighbor = currentCell;
        let minDist = Infinity;
        const neighbors = [
          { x: currentCell.x + 1, y: currentCell.y },
          { x: currentCell.x - 1, y: currentCell.y },
          { x: currentCell.x, y: currentCell.y + 1 },
          { x: currentCell.x, y: currentCell.y - 1 },
          { x: currentCell.x + 1, y: currentCell.y + 1 },
          { x: currentCell.x - 1, y: currentCell.y + 1 },
          { x: currentCell.x + 1, y: currentCell.y - 1 },
          { x: currentCell.x - 1, y: currentCell.y - 1 },
        ];
        for (const n of neighbors) {
          if (
            n.x >= 0 && n.x < this.navGrid[0].length &&
            n.y >= 0 && n.y < this.navGrid.length &&
            this.navGrid[n.y][n.x] === 0
          ) {
            const dist = Math.abs(n.x - targetCell.x) + Math.abs(n.y - targetCell.y);
            if (dist < minDist) {
              minDist = dist;
              bestNeighbor = n;
            }
          }
        }
        nextCell.x = bestNeighbor.x;
        nextCell.y = bestNeighbor.y;          

      }
      const target = convertToWorldCoordinates(nextCell);        

      // Calcula direção
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        // Move suavemente em direção ao próximo nó
        nextX += (dx / dist) * this.speed;
        nextY += (dy / dist) * this.speed;
      } else {
        // Se já está muito próximo do centro da célula, pode avançar para o próximo nó no próximo update
        nextX = target.x;
        nextY = target.y;
      }        
              
      
      if (!isWallColliding(nextX, nextY, this.radius)) {
        this.x = nextX;
        this.y = nextY;                   
      } else  {
        if (!isWallColliding(nextX, this.y, this.radius))  {
          this.x = nextX;
        } else if (!isWallColliding(this.x, nextY, this.radius))  {
          this.y = nextY;
        } else {          
          // Se não puder se mover, recalcula rota, se não for possível, interrompe a perseguição e se estiver bem próximo lança um ataque.
          this.chasingPath = findPath(
            convertToCellCoordinates(this.x, this.y),
            convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y),
            this.navGrid
          );
          if (this.chasingPath.length <= 0) {
            console.log('Imovel');
            // Verifica a distância do player para o inimigo
            const dxPlayer = game.player.x - this.x;
            const dyPlayer = game.player.y - this.y;
            const distPlayer = Math.hypot(dxPlayer, dyPlayer);

            // Se o player estiver a menos de 150 pixels do inimigo e o inimigo estiver imóvel, emite um ataque
            // Isso simula o ataque do inimigo quando ele não consegue se mover
            if (distPlayer < 150 && this instanceof DeepDarkness) {
               this.emitAttack(); 
            }
          }
        }
      }      
      
      moved = this.x !== prevX || this.y !== prevY;
      if (moved) {
        if (this.chasingPath != null && this.chasingPath.length > 1) {
          this.chasingPath.splice(1, 1); // Remove o primeiro nó, pois já se moveu até lá.
        }

        if ( (this instanceof Darkness && (now - this.lastEcho) >= this.miliSecBetweenEchos) || this.forceNextStep ) {
          this.lastEcho = now;
          this.forceNextStep = false;          
          this.emitEcho();
          //playStepSound(false);
        }
      }

      // Se chegou ao ponto de perseguição, reseta o ponto ou se a distância for muito pequena
      // Isso evita que o inimigo fique preso no ponto de perseguição
      if (this.chasingPoint.x != 0 && this.chasingPoint.y != 0) {
        const dx = this.x - this.chasingPoint.x;
        const dy = this.y - this.chasingPoint.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 5) { // Se estiver muito próximo do ponto de perseguição
          this.chasingPoint = { x: 0, y: 0 };
          this.touchingLines = 0; // Reseta o contador de linhas tocadas
          this.chasing = false; // Para a perseguição
          this.visible = false; // Torna invisível
          this.chasingPath = []; // Limpa o caminho
        }
      }     

      // Player alcançado pelo inimigo
      if (isPlayerColliding(this.x, this.y, this.radius + 8)) { game.player.isDead = true; }
    }

    /*if (this.chasingPath.length > 0) {
      this.chasing = true; // Continua perseguindo se ainda há caminho
      this.visible = true; // Mantém visível enquanto estiver perseguindo
    }*/

  }


  // Desenha o inimigo
  // Se for um inimigo do tipo radar, desenha o efeito de circulos ondulados
  draw() {   
    if (config.DEBUG) {        
      // Desenha uma representação visual das células do pathfinder ao redor do inimigo
      if (this.navGrid && this.navGrid.length > 0) {
        const cellSize = config.CELL_SIZE;
        const cellX = Math.floor(this.x / cellSize);
        const cellY = Math.floor(this.y / cellSize);

        game.ctx.save();
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = cellX + dx;
            const ny = cellY + dy;
            if (
              ny >= 0 && ny < this.navGrid.length &&
              nx >= 0 && nx < this.navGrid[0].length
            ) {
              const blocked = this.navGrid[ny][nx] !== 0;
              game.ctx.strokeStyle = blocked ? "red" : "lime";
              game.ctx.lineWidth = 1;
              game.ctx.strokeRect(
                nx * cellSize - game.camera.x,
                ny * cellSize - game.camera.y,
                cellSize, cellSize
              );
            }
          }
        }
        game.ctx.restore();
      }

      //Desenha o caminho do pathfinder ===
      if (this.chasingPath && this.chasingPath.length > 1) {
        game.ctx.save();
        game.ctx.strokeStyle = "yellow";
        game.ctx.lineWidth = 2;
        game.ctx.beginPath();
        for (let i = 0; i < this.chasingPath.length; i++) {
          // Converte célula para coordenada do mundo
          const cell = this.chasingPath[i];
          const wx = cell.x * config.CELL_SIZE + config.CELL_SIZE / 2 - game.camera.x;
          const wy = cell.y * config.CELL_SIZE + config.CELL_SIZE / 2 - game.camera.y;
          if (i === 0) {
            game.ctx.moveTo(wx, wy);
          } else {
            game.ctx.lineTo(wx, wy);
          }
        }
        game.ctx.stroke();
        game.ctx.restore();
      } 
    }    
  }  
}
