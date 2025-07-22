class Enemy extends MapObject {
  waveCount = 90; // Contagem de ondas para o efeito de radar
  waveAmplitude = 2; // Amplitude da onda para o efeito de radar
  _attackRadiusOffset = 0.5; // Offset do raio de ataque
  _distanceToAttack = 200; // Distância mínima para o inimigo atacar
  _attackForce = 10; // Força do ataque ao colidir com o player (escala de 0-100)
  speed = 0.4; // Velocidade de movimento do inimigo
  _miliSecBetweenEchos = 1000; // Intervalo entre os ecos
  _miliSecBetweenAttacks = 10000; // Tempo mínimo entre os ataques em milissegundos
  _miliSecBetweenSurfering = 500; // Tempo mínimo entre os sofrimentos do inimigo em milissegundos
  _enemyCanCollide = false; // Indica se o objeto pode colidir com um inimigo
  _playerCanCollide = true; // Indica se o objeto pode colidir com o jogador
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
  lastEcho = performance.now(); // Último eco emitido pelo inimigo
  forceNextStep = false; // Força o próximo passo do inimigo, usado para testes
  navGrid = []; // Matriz de navegação do inimigo dentro do mapa, será preenchida pelo mapa no momento do carregamento
  chasingPath = []; // Último caminho calculado pelo inimigo  
  _lastAttack = 0; // Último ataque emitido pelo inimigo
  _lastSufering = 0; // Último sofrimento do inimigo, usado para evitar ataques repetidos
  _soundVisible = null; // Usado ao exibir o inimigo
  _soundEcho = game.sounds.getSound('enemy_echo'); // Usado para tocar o som de eco
  _soundAttack = null; // Usado para tocar o som de ataque
  _soundChasing = null; // Usado enquanto estiver em perseguição
  _lastTimeChasing = 0; // Último marcador que o inimigo realizou movimento de perseguição
  _timeStartSeeking = 0; // Momento no qual o o inimigo iniciou a busca no perímetro
  _lastSeekMove = 0; // Último movimento de busca
  _seekCooldown = 15000; // Tempo para busca no perímetro, 
  _hasEcho = true;

  // Construtor da classe Enemy
  // Recebe as coordenadas x e y, tipo, tamanho e velocidade do inimigo
  constructor(x, y, name = 'Enemy', hasEcho = true, radius = 5, speed = 0.4) {
    super(x, y, name, radius);
    this._hasEcho = hasEcho;
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.name = name;
    this.radius = radius;
    this.createCircleHitbox(0, 0, this.radius +1);
  }

  attack() {
      // Evita danos repetidos em um curto período
      if (this._lastSufering != 0 &&  window.game.gameTime - this._lastSufering <= this._miliSecBetweenSurfering) 
        return; 
      game.player.suffering(this._attackForce); // Aplica dano ao player
      this._lastSufering = performance.now(); // Atualiza o tempo do último sofrimento
  }

  emitSecondaryAttack() {
    if (this._soundAttack != "") { game.sounds.play(this._soundAttack); }
  }

  seek(x, y) {
    if (this.visible) {      
      if (!this.seeking)
        this._timeStartSeeking = window.game.gameTime;

      // Evita ir para outro ponto se o inimigo estiver causando sofrimento ao player
      if (this._lastSufering != 0 &&  window.game.gameTime - this._lastSufering <= this._miliSecBetweenSurfering) 
        return;      
     
      // Procura uma célula livre ao redor
      const oricell = convertToCellCoordinates(x, y);
      var nextcell = getRandomFreeNeighborCell(oricell, this.navGrid);
      // Se não encontrou célula livre, interrompe a perseguição
      if (nextcell.x == oricell.x && nextcell.y == oricell.y) {
        //console.log(`Sem células livres ao redor: ${this.name}`);
        this.seeking = false;
      } 
      // inicia movimento suave até próxima célula
      else 
      {        
        nextcell = convertToWorldCoordinates(nextcell);        
        this.seekPoint = { x: nextcell.x, y: nextcell.y };
        //console.log(`Indo até próx. célula livre: ${this.name} = ${this.seekPoint.x} , ${this.seekPoint.y}`);
        this.seeking = true;
        this.chasing = false;
        this.visible = false;
        this.chasingPoint.x = 0;
        this.chasingPoint.y = 0;
        this.chasingPath = [];        
        this._lastSeekMove = window.game.gameTime;
        if (this._hasEcho) {
          // Verifica se precisa emitir eco
          if ( (this._hasEcho && (window.game.gameTime - this.lastEcho) >= (this._miliSecBetweenEchos * 0.5)) || this.forceNextStep ) {
            this.lastEcho = window.game.gameTime;
            this.forceNextStep = false;          
            this.emitEcho();
          }
        }
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
          //console.log(`Não foi possível mover ${this.name}`);
          return false;
          // Se não puder se mover em nenhum eixo
          // Recalcula rota e no próximo update vai tentar essa rota;
          // this.calcChasingPath();
        }
      }
  }

  emitEcho() {
    if (!this._hasEcho) 
      return;

    // Efeito sonoro direcional e de volume
    if (this._soundEcho) {
      const dx = this.x - game.player.x;
      const dy = this.y - game.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = config.MAX_DISTANCE_SOUND; // tente sem dividir por 4
      let volume = 1 - Math.min(dist / maxDist, 1);
      volume = Math.max(0, Math.min(1, volume));
      let pan = dx / (game.canvas.width / 2);
      pan = Math.max(-1, Math.min(1, pan));
            
      let id = this._soundEcho.play();
      this._soundEcho.pos(pan, 0, 0, id);
      this._soundEcho.volume(volume, id);
    }

    for (let i = 0; i < this.lineCount; i++) {
      const angle = ((Math.PI * 2) / this.lineCount) * i;      
      var x = this.x;
      var y = this.y; 

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
    if (this.chasing && this._soundChasing != null) { 
        const dx = this.x - game.player.x;
        const dy = this.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = config.MAX_DISTANCE_SOUND; // ajuste conforme o tamanho do seu mapa/câmera
        let volume = 1 - Math.min(dist / maxDist, 1);
        volume = Math.max(0, Math.min(1, volume));
        let pan = dx / (game.canvas.width / 2);
        pan = Math.max(-1, Math.min(1, pan));

        if (this._soundChasingId == undefined || this._soundChasingId == null) {
            this._soundChasingId = this._soundChasing.play();
            // --- Efeito espacial ---
            this._soundChasing.pos(pan, 0, 0, this._soundChasingId);
            this._soundChasing.volume(volume, this._soundChasingId);
        } else {
            if (!this._soundChasing.playing(this._soundChasingId))
                this._soundChasingId = this._soundChasing.play(this._soundChasingId);
            // Atualiza o panning e volume mesmo se já estiver tocando
            this._soundChasing.pos(pan, 0, 0, this._soundChasingId);
            this._soundChasing.volume(volume, this._soundChasingId);
        }
    }
    // Se não estiver caçando interrompe o som, caso esteja tocando
    else if (!this.chasing && this._soundChasingId != null) {      
        if (!this._soundChasing.playing(this._soundChasingId))
            this._soundChasing.stop(this._soundChasingId);
        this._soundChasingId = null; // Reseta o ID do som de perseguição
    }
}

  update() {
    super.update();
    
    const now = window.game.gameTime;

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
        if ( (this._hasEcho && (now - this.lastEcho) >= this._miliSecBetweenEchos) || this.forceNextStep ) {
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
            //console.log(`Encerrando perseguição e preparando busca: ${this.name}`);
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
      if (this._timeStartSeeking > 0 && (window.game.gameTime - this._timeStartSeeking) > this._seekCooldown) {
        //console.log(`Encerrando busca: ${this.name}`);
        this.seeking = false;
        this.visible = false;
        this.seekPoint = {x: 0, y: 0 };
        this._timeStartSeeking = 0;
        this._lastSeekMove = 0;
      } 
      // Se o tempo ainda permite, dá prosseguimento a varredura
      else {        
        const dx = this.seekPoint.x - this.x;
        const dy = this.seekPoint.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1) { // Move suavemente em direção ao target (com 10% da velocidade normal)
          nextX += (dx / dist) * (this.speed * 0.8);
          nextY += (dy / dist) * (this.speed * 0.8);
        } else { // Se já está muito próximo, pode avançar para o ponto final
          nextX = this.seekPoint.x;
          nextY = this.seekPoint.y;
        }        
        this.moveTo(nextX, nextY);
        moved = this.x !== prevX || this.y !== prevY;
        // Se não está se movendo prepara próximo ponto de busca;
        if (!moved && (window.game.gameTime - this._lastSeekMove > 200)) { 
          this.seek(this.x, this.y); 
        }
      }
    }     

    // Verifica e atualiza os sons
    this.checkSounds();

    if (!this._playerColliding && doSeek) {
      //console.log(`Avaliando busca: ${this.name}`);
      this.visible = true;
      this.seek(this.x, this.y);
    }  
  }

  draw() {          
    if (!this.visible && !config.DEBUG) return; // Se o inimigo não estiver visível, não desenha nada    

    if (config.DEBUG) {        
      super.draw();

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

      game.ctx.restore();
    }
  }

  onCollision(obj) {
    if (obj instanceof Player) {
       this.attack(); 
    }
  }
  
}
