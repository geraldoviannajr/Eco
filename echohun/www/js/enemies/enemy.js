class Enemy {
  x = 0;
  y = 0;
  name = "Inimigo"; // Nome do inimigo
  type = "echo"; // Tipo do inimigo, pode ser 'echo' ou 'radar'
  createdAt = Date.now(); // Data de criação do inimigo
  waveCount = 90; // Contagem de ondas para o efeito de radar
  waveAmplitude = 2; // Amplitude da onda para o efeito de radar
  radius = 5; // Tamanho do inimigo
  _attackRadiusOffset = 0.5; // Offset do raio de ataque
  _distanceToAttack = 200; // Distância mínima para o inimigo atacar
  _attackForce = 10; // Força do ataque ao colidir com o player (escala de 0-100)
  speed = 0.4; // Velocidade de movimento do inimigo
  _miliSecBetweenEchos = 1000; // Intervalo entre os ecos
  _miliSecBetweenAttacks = 10000; // Tempo mínimo entre os ataques em milissegundos
  _miliSecBetweenSurfering = 500; // Tempo mínimo entre os sofrimentos do inimigo em milissegundos
  visible = false; // Indica se o inimigo está visível
  chasing = false; // Indica se o inimigo está perseguindo o jogador
  seeking = false; // Indica se o inimigo está realizando buscas no perímetro
  touchingLines = 0; // Contador de linhas tocadas pelo inimigo
  bodyColor = `rgba(0,0,0,1)`; // Cor do corpo do inimigo
  echoColor = [255, 0, 0, 0.8]; // Cor do eco do inimigo
  expansionSpeed = 4; // Velocidade de expansão do eco
  duration = 1000; // Duração do eco
  lineCount = 24; // Número de linhas no efeito de eco  
  chasingPoint = {x: 0, y : 0}; // Último ponto de perseguição do inimigo
  seekPoint = {x: 0, y : 0}; // Último ponto de busca no perímetro do inimigo
  lastEcho = Date.now(); // Último eco emitido pelo inimigo
  forceNextStep = false; // Força o próximo passo do inimigo, usado para testes
  navGrid = []; // Matriz de navegação do inimigo dentro do mapa, será preenchida pelo mapa no momento do carregamento
  chasingPath = []; // Último caminho calculado pelo inimigo  
  _lastAttack = 0; // Último ataque emitido pelo inimigo
  _lastSufering = 0; // Último sofrimento do inimigo, usado para evitar ataques repetidos
  _soundVisible = ""; // Nome do som do inimigo, usado ao exibir o inimigo
  _soundEcho = ""; // Nome do som do inimigo, usado para tocar o som de eco
  _soundAttack = ""; // Nome do som do inimigo, usado para tocar o som de ataque
  _soundChasing = ""; // Nome do som do inimigo, usado enquanto estiver em perseguição
  _lastTimeChasing = 0; // Último marcador que o inimigo realizou movimento de perseguição
  _lastTimeSeeking = 0; // Último tempo que o inimigo realizou movimento de busca no perímetro
  _seekCooldown = 10000; // Tempo para busca no perímetro, 

  // Construtor da classe Enemy
  // Recebe as coordenadas x e y, tipo, tamanho e velocidade do inimigo
  constructor(x, y, name = 'Enemy', type = "echo", radius = 5, speed = 0.4) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
    this.radius = radius;
    this.speed = speed;
  }

  attack() {
      // Evita danos repetidos em um curto período
      if (Date.now() - this._lastSufering <= this._miliSecBetweenSurfering) 
        return; 
      game.player.suffering(this._attackForce); // Aplica dano ao player
      this._lastSufering = Date.now(); // Atualiza o tempo do último sofrimento
  }

  emitSecondaryAttack() {
    if (this._soundAttack != "") { game.sounds.play(this._soundAttack); }
  }

  seek(x, y) {
    if (this.visible) {
      if (this.seeking)
        console.log(`Atualizando busca: ${this.name}`)
      else 
        console.log(`Iniciando busca: ${this.name}`);

      // Procura uma célula livre ao redor
      const oricell = convertToCellCoordinates(x, y);
      var nextcell = getRandomFreeNeighborCell(oricell, this.navGrid);
      // Se não encontrou célula livre, interrompe a perseguição
      if (nextcell.x == oricell.x && nextcell.y == oricell.y) {
        console.log(`Sem células livres ao redor: ${this.name}`);
        this.seeking = false;
      } 
      // inicia movimento suave até próxima célula
      else 
      {
        this.emitEcho();
        nextcell = convertToWorldCoordinates(nextcell);        
        this.seekPoint = { x: nextcell.x, y: nextcell.y };
        console.log(`Indo até próx. célula livre: ${this.name} = ${this.seekPoint.x} , ${this.seekPoint.y}`);
        this.seeking = true;
        this.chasing = false;
        this.visible = false;
        this.chasingPoint.x = 0;
        this.chasingPoint.y = 0;
        this.chasingPath = [];
      }
    }
  }

  moveTo(nextX, nextY) {
      // Se o ponto futuro não colidir com parede se move completamente até lá
      if (!isWallColliding(nextX, nextY, this.radius)) { this.x = nextX; this.y = nextY; return true;} 
      else 
      {
        // Se colidir num eixo tenta mover somente no outro eixo
        if (!isWallColliding(nextX, this.y, this.radius))  { this.x = nextX; return true;} 
        else if (!isWallColliding(this.x, nextY, this.radius))  { this.y = nextY; return true;} 
        else {          
          console.log(`Não foi possível mover ${this.name}`);
          return false;
          // Se não puder se mover em nenhum eixo
          // Recalcula rota e no próximo update vai tentar essa rota;
          // this.calcChasingPath();
        }
      }
  }

  emitEcho() {
    if (this._soundEcho != "") { game.sounds.play(this._soundEcho); }

    for (let i = 0; i < this.lineCount; i++) {
      const angle = ((Math.PI * 2) / this.lineCount) * i;      
      var x = this.x;
      var y = this.y; 

      if (this.radius > 1) {
        x = this.x + Math.cos(angle) * (this.radius);
        y = this.y + Math.sin(angle) * (this.radius); 

        if (isWallColliding(x, y, this.radius)) {
          // Se colidir com parede, ajusta a posição para evitar que o eco nasça dentro da parede
          const wallOffset = 2; // Distância mínima do eco para a parede
          const offsetX = Math.cos(angle) * wallOffset;
          const offsetY = Math.sin(angle) * wallOffset;
          x += offsetX;
          y += offsetY;
          // Verifica novamente se colide com parede após o ajuste
          if (isWallColliding(x, y, this.radius)) {
            continue; // Pula este eco se ainda colidir com parede
          }        
        } 
      }
           
      game.lines.push( new EchoLine(x, y, angle, "enemy", this, 3) );
    }
  }

  calcChasingPath() {
    //console.log(`Calculando caminho: ${this.name}`);
    this.chasing = true; // Começa a perseguir o jogador, se já não estiver
    this.visible = true; // Torna o inimigo visível
    this.chasingPath = findPath(
      convertToCellCoordinates(this.x, this.y),
      convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y),
      this.navGrid
    );   
  }

  checkSounds() {
    // Se estiver caçando verifica se está tocando som, se não tiver toca
    if (this.chasing && this._soundChasing != "") 
    { 
      if (this._soundChasingId == undefined || this._soundChasingId == null) {
        this._soundChasingId = game.sounds.play(this._soundChasing);
      } else {
         if (!game.sounds.isPlaying(this._soundChasing, this._soundChasingId))
          this._soundChasingId = game.sounds.play(this._soundChasing, this._soundChasingId);
      }
    }
    // Se não estiver caçando interrompe o som, caso esteja tocando
    else if (!this.chasing && this._soundChasingId != null) 
    {
      game.sounds.stop(this._soundChasing, this._soundChasingId);
      this._soundChasingId = null; // Reseta o ID do som de perseguição
    }
  }

  update() {
    const now = Date.now();

    // Verifica se tem ponto de perseguição ativo
    // OBS.: O littledaskness nunca para a perseguição
    if (this.chasingPoint.x != 0 || this.chasingPoint.y != 0)  { 
      this.chasing = true; // Começa a perseguir o jogador, se já não estiver
      this.visible = true; // Torna o inimigo visível
      //if (this.chasingPath == null || this.chasingPath.length == 0)
        this.calcChasingPath(); 
    } 
    else if (!(this instanceof LittleDarkness)) { this.chasing = false; this.visible = false; }

    var moved = false;
    var doSeek = false;
    const prevX = this.x;
    const prevY = this.y;
    var nextX = this.x;
    var nextY = this.y;
    const currentCell = convertToCellCoordinates(this.x, this.y);

    // Está em perseguição
    if (this.chasing) 
    {
      //console.log(`Em perseguição: ${this.name}`);
      this.seeking = false;
      this._lastTimeChasing = now; // Atualiza o tempo da última perseguição
      
      var targetCell = convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y);
      var target = convertToWorldCoordinates(targetCell);
      var nextCell = currentCell;
      var tipoMov = 'directMove';

      // Se o inimigo tem um caminho de perseguição, pega o próximo nó do caminho
      if (this.chasingPath != null && this.chasingPath.length > 1) {
        nextCell = this.chasingPath[1];
        target = convertToWorldCoordinates(nextCell);
        tipoMov = 'chasingPath';
      } else {
        // Não há caminho, tenta mover para a célula vizinha mais próxima do chasingPoint          
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
        if (!(nextCell.x == currentCell.x && nextCell.y == currentCell.y)) {
          target = convertToWorldCoordinates(nextCell);
          tipoMov = 'bestNeighbor';
        }
      }

      //console.log(`Tipo do movimento: ${this.name} = ${tipoMov}`);

      // Calcula direção
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) { // Move suavemente em direção ao target
        nextX += (dx / dist) * this.speed;
        nextY += (dy / dist) * this.speed;
      } else { // Se já está muito próximo do centro da célula, pode avançar para o target
        nextX = target.x;
        nextY = target.y;
      }        

      this.moveTo(nextX, nextY);
      
      moved = this.x !== prevX || this.y !== prevY;     
      if (moved) {
        // Se estiver muito próximo do ponto de perseguição vai pra ele
        if (this.chasingPoint.x != 0 && this.chasingPoint.y != 0) {
          const dx = this.x - this.chasingPoint.x;
          const dy = this.y - this.chasingPoint.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 5) { 
            this.x = this.chasingPoint.x;
            this.y = this.chasingPoint.y;
          }
        }

        // Se foi movimentado por chasingPath, remove o primeiro nó
        if (tipoMov == 'chasingPath' && this.chasingPath != null && this.chasingPath.length > 1) { this.chasingPath.splice(1, 1); }

        // Verifica se precisa emitir eco
        if ( (this instanceof Darkness && (now - this.lastEcho) >= this._miliSecBetweenEchos) || this.forceNextStep ) {
          this.lastEcho = now;
          this.forceNextStep = false;          
          this.emitEcho();
        }

        
        // Se chegou ao ponto de perseguição, ou se a distância for muito pequena reseta o ponto 
        // Isso evita que o inimigo fique preso no ponto de perseguição
        if (this.chasingPoint.x != 0 && this.chasingPoint.y != 0) {
          const dx = this.x - this.chasingPoint.x;
          const dy = this.y - this.chasingPoint.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 5) { // Se estiver muito próximo do ponto de perseguição
            this.chasingPoint = { x: 0, y: 0 };
            this.chasing = false; // Para a perseguição
            this.visible = false; // Torna invisível
            this.chasingPath = []; // Limpa o caminho            
            console.log(`Encerrando perseguição e preparando busca: ${this.name}`);
            doSeek = true;
          }
        }
        
      } 
      // Se não se moveu e é um DeepDarkness ainda em perseguição
      // Verifica a distância do player para o inimigo
      // Se o player estiver próximo ao inimigo, emite um ataque secundário
      else if (this.chasing && this instanceof DeepDarkness) {
          const dxPlayer = game.player.x - this.x;
          const dyPlayer = game.player.y - this.y;
          const distPlayer = Math.hypot(dxPlayer, dyPlayer);
          if (distPlayer < this._distanceToAttack && (now - this._lastAttack) >= this._miliSecBetweenAttacks) { 
            this.emitSecondaryAttack(); 
          }
      }           
    } 
    // Não está em perseguição mas está em busca no perímetro
    else if (this.seeking)
    {
      this.visible = true;
      // Verifica se o tempo de cooldown de busca já passou, se passou encerra a busca 
      if (this._lastTimeSeeking > 0 && (now - this._lastTimeSeeking) > this._seekCooldown) {
        console.log(`Encerrando busca: ${this.name}`);
        this.seeking = false;
        this.visible = false;
        this.seekPoint = {x: 0, y: 0 };
        this._lastTimeSeeking = 0;
      } 
      // Se o tempo ainda permite, dá prosseguimento a varredura
      else {        
        const dx = this.seekPoint.x - this.x;
        const dy = this.seekPoint.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1) { // Move suavemente em direção ao target (com 30% da velocidade normal)
          nextX += (dx / dist) * (this.speed * 0.3);
          nextY += (dy / dist) * (this.speed * 0.3);
        } else { // Se já está muito próximo, pode avançar para o ponto final
          nextX = this.seekPoint.x;
          nextY = this.seekPoint.y;
        }        
        this.moveTo(nextX, nextY);
        moved = this.x !== prevX || this.y !== prevY;
        // Se não está se movendo prepara próximo ponto de busca;
        if (!moved) { this.seek(this.x, this.y); }
      }
      this._lastTimeSeeking = Date.now();
    }     

    // Verifica e atualiza os sons
    this.checkSounds();
  
    // Verifica se o player foi alcançado pelo inimigo e se sim, realiza o ataque direto
    if (isPlayerColliding(this.x, this.y, this.radius + (this.radius * this._attackRadiusOffset))) { 
      this.attack();
    } else if (doSeek) {
      console.log(`Avaliando busca: ${this.name}`);
      this.visible = true;
      this.seek(this.x, this.y);
    }  
  }

  draw() {   
    if (!this.visible && !config.DEBUG) return; // Se o inimigo não estiver visível, não desenha nada
    if (config.DEBUG) {        
      game.ctx.save();

      // Desenha uma representação visual das células do pathfinder ao redor do inimigo
      if (this.navGrid && this.navGrid.length > 0) {
        const cellSize = config.CELL_SIZE;
        const cellX = Math.floor(this.x / cellSize);
        const cellY = Math.floor(this.y / cellSize);

        
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
      }      

      game.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      game.ctx.beginPath();
      game.ctx.arc(this.x - game.camera.x, this.y - game.camera.y, this.radius, 0, Math.PI * 2);
      game.ctx.fill();

      game.ctx.stroke();
      game.ctx.restore();
    }
  }
  
  
}
