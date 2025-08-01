class Radar extends Control {
    x = 115;
    y = 35;
    active = true;
    visible = true;    
    radius = 30; // Raio visual do radar (em pixels)    
    range = 0; // Raio de atuação do radar (em unidades do jogo)
    battery = 100; // 100%    
    batteryDuration = 180; // duração total da bateria em segundos (padrão: 180s)
    _lastBatteryUpdate = 0;    

    constructor() {
        super();
    }

    click() {
        super.click();
        this.active = !this.active;
    }

    drawBattery(ctx) {
        // --- Indicador circular de bateria na borda do radar ---
        const radarX = this.x;
        const radarY = this.y;
        const radarRadius = this.radius +3;

        const batteryRadius = radarRadius;
        const batteryX = radarX;
        const batteryY = radarY;
        
        // Nível da bateria (0-100)
        const batteryPerc = Math.max(0, Math.min(100, this.battery));
        
        // Ângulo base (começa do topo, sentido horário)
        const startAngle = -Math.PI / 2; // 12h (topo)
        const endAngle = startAngle + (2 * Math.PI * batteryPerc / 100); // sentido horário
        
        ctx.save();        
       
        ctx.beginPath();
        ctx.arc(batteryX, batteryY, batteryRadius - 1, 0, Math.PI * 2);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 5;
        ctx.stroke();

       
        // Cor da bateria baseada no nível
        let color = '#4CAF50'; // Verde
        if (batteryPerc <= 25) {
            color = '#FF4C4C'; // Vermelho
        } else if (batteryPerc <= 50) {
            color = '#FFD700'; // Amarelo
        }
        
        // Arco da bateria (sentido horário)
        if (batteryPerc > 0) {
            ctx.beginPath();
            ctx.arc(batteryX, batteryY, batteryRadius - 1, startAngle, endAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        // Indicador de nível baixo (pisca quando <= 25%)
        if (batteryPerc <= 25 && batteryPerc > 0) {
            const time = window.game.gameTime * 0.005;
            const blinkAlpha = 0.3 + 0.4 * Math.abs(Math.sin(time * 3));
            ctx.beginPath();
            ctx.arc(batteryX, batteryY, batteryRadius - 1, startAngle, endAngle);
            ctx.strokeStyle = `rgba(0,0,0,${blinkAlpha})`;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawExitIndicator(ctx, radarX, radarY, radarRadius) {
        // Encontra a posição da saída no mapa
        const exit = window.game.map.exitDoor;
        if (!exit) return;

        // Calcula a direção da saída em relação ao player
        const player = window.game.player;
        const dx = exit.x - player.x;
        const dy = exit.y - player.y;
        
        // Calcula o ângulo da direção
        const angle = Math.atan2(dy, dx);
        
        // Posição da seta na borda do radar
        const arrowRadius = radarRadius + 6;
        const arrowX = radarX + Math.cos(angle) * arrowRadius;
        const arrowY = radarY + Math.sin(angle) * arrowRadius;
        
        // Desenha a seta
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle + Math.PI / 2); // Rotaciona para apontar na direção correta
        
        // Cor da seta (azul neon para combinar com o tema high-tech do radar)
        ctx.fillStyle = '#00FFFF';
        ctx.strokeStyle = '#00CCCC';
        ctx.lineWidth = 2;
        
        // Forma da seta (triângulo)
        ctx.beginPath();
        ctx.moveTo(0, -6); // Ponta da seta
        ctx.lineTo(-3, 3); // Base esquerda
        ctx.lineTo(3, 3);  // Base direita
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Efeito de brilho/glow
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 6;
        ctx.stroke();
        
        ctx.restore();
    }
   
    draw = () => {
        super.draw();

        if (!this.visible) return;

        // Atualiza desgaste da bateria
        if (this.active && this.battery > 0 && this.batteryDuration > 0) {
            const now = game.gameTime;
            if (this._lastBatteryUpdate === null) { this._lastBatteryUpdate = now; } else 
            {
                const elapsed = (now - this._lastBatteryUpdate) / 1000; // segundos
                if (elapsed > 0) {
                    const batteryLoss = (elapsed / this.batteryDuration) * 100;
                    this.battery = Math.max(0, this.battery - batteryLoss);
                    this._lastBatteryUpdate = now;
                }
            }
        } else {
            this._lastBatteryUpdate = game.gameTime;
        }
                
        if (this.battery <= 0) { this.active = false; }
        if (this.range == 0) { this.range = game.canvas.width; }

        const ctx = game.ctx;
        // Posição do radar na tela
        const radarX = this.x;
        const radarY = this.y;
        const radarRadius = this.radius +3;

        // --- Fundo do radar ---
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(radarX, radarY, radarRadius -2, 0, Math.PI * 2);
        ctx.fillStyle = "#00000088";
        ctx.fill();
        ctx.globalAlpha = 1;

        // --- Linhas de escala internas ---
        ctx.setLineDash([3, 5]);
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(radarX, radarY, (radarRadius / 3) * i, 0, Math.PI * 2);
            ctx.strokeStyle = (this.active ? "rgb(121, 121, 121)" : "#362e0142");
            ctx.lineWidth = 0.3;
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Desenha até aqui se não estiver ativo;
        if (!this.active || game.isPaused) {
            // Escreve "OFF" no centro do radar
            ctx.save();
            ctx.fillStyle = '#AEEEEE';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            //ctx.fillStyle = "#FFD700";
            //ctx.shadowColor = "#000";
            //ctx.shadowBlur = 6;
            ctx.fillText("OFF", radarX, radarY);
            ctx.restore();            
        }
        else     
        {
            // --- Ponteiro animado do radar (efeito de varredura) ---
            const time = window.game.gameTime * 0.001;
            const sweepAngle = (time % 4) * Math.PI / 2; // 4 segundos para uma volta completa
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(radarX, radarY);
            ctx.arc(radarX, radarY, radarRadius, sweepAngle, sweepAngle + Math.PI / 1.6);
            ctx.closePath();
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = "#8f8f8f";
            ctx.fill();
            ctx.restore();

            // --- Player sempre no centro do radar ---
            ctx.beginPath();
            ctx.arc(radarX, radarY, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#636363ff";
            ctx.fill();

            // --- INDICADOR DE PÂNICO ---
            // Se o player sofreu dano recentemente, pisca o fundo do radar em vermelho
            if (game.player._lastSuffering && (game.gameTime - game.player._lastSuffering < 800)) {
                ctx.save();
                ctx.globalAlpha = 0.35 + 0.25 * Math.abs(Math.sin(time * 10));
                ctx.beginPath();
                ctx.arc(radarX, radarY, radarRadius + 4, 0, Math.PI * 2);
                ctx.fillStyle = "#ff2222";
                ctx.fill();
                ctx.restore();
            }

            // --- CLIPPING: Limita tudo que for desenhado a seguir ao círculo do radar ---
            ctx.save();
            ctx.beginPath();
            ctx.arc(radarX, radarY, radarRadius - 1.5, 0, Math.PI * 2);
            ctx.clip();        

            // --- Mostra monstros próximos ao player ---
            for (const enemy of game.map.enemies) {
                // Calcula a distância do inimigo ao player
                const dx = enemy.x - game.player.x;
                const dy = enemy.y - game.player.y;
                const dist = Math.hypot(dx, dy);

                if (dist <= this.range) {
                    // Escala a posição do inimigo para o radar
                    const scale = radarRadius / this.range;
                    const ex = radarX + dx * scale;
                    const ey = radarY + dy * scale;

                    // Tamanho do ponto do inimigo proporcional ao seu raio
                    const percRadius = enemy.radius * 100 / 500;
                    const radarEnemyRadius = Math.max(2, percRadius * (radarRadius / this.range) * 12);

                    // --- EFEITO DE REVELAÇÃO PELO PONTEIRO ---
                    // Ângulo do inimigo em relação ao centro do radar
                    let enemyAngle = Math.atan2(ey - radarY, ex - radarX);
                    if (enemyAngle < 0) enemyAngle += Math.PI * 2;

                    // Normaliza sweepAngle para [0, 2PI]
                    let pointerAngle = sweepAngle % (Math.PI * 2);

                    // Diferença angular absoluta
                    let diff = Math.abs(pointerAngle - enemyAngle);
                    if (diff > Math.PI) diff = Math.PI * 2 - diff;

                    let alpha = 1 - Math.min(diff / 2.5, 1); // 2.5 rad = ~143 graus de revelação total
                    alpha = 0.25 + 0.75 * alpha; // Nunca fica totalmente invisível (mínimo 0.25, máximo 1)                

                    ctx.beginPath();
                    ctx.arc(ex, ey, radarEnemyRadius, 0, Math.PI * 2);
                    ctx.fillStyle = enemy.visible ? "#ff0000" : '#FFA500';
                    ctx.globalAlpha = alpha;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }        
            }

            // --- Mostra power ups próximos ao player ---
            for (const obj of game.map.objects) {
                if (obj instanceof PowerUp && obj.visible) {
                    // Calcula a distância do power up ao player
                    const dx = obj.x - game.player.x;
                    const dy = obj.y - game.player.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist <= this.range) {
                        // Escala a posição do power up para o radar
                        const scale = radarRadius / this.range;
                        const ex = radarX + dx * scale;
                        const ey = radarY + dy * scale;

                        // Tamanho do ponto do power up proporcional ao seu raio
                        const radarPowerUpRadius = 1;

                        // --- EFEITO DE REVELAÇÃO PELO PONTEIRO ---
                        // Ângulo do power up em relação ao centro do radar
                        let powerUpAngle = Math.atan2(ey - radarY, ex - radarX);
                        if (powerUpAngle < 0) powerUpAngle += Math.PI * 2;

                        // Normaliza sweepAngle para [0, 2PI]
                        let pointerAngle = sweepAngle % (Math.PI * 2);

                        // Diferença angular absoluta
                        let diff = Math.abs(pointerAngle - powerUpAngle);
                        if (diff > Math.PI) diff = Math.PI * 2 - diff;

                        let alpha = 1 - Math.min(diff / 2.5, 1); // 2.5 rad = ~143 graus de revelação total
                        alpha = 0.25 + 0.75 * alpha; // Nunca fica totalmente invisível (mínimo 0.25, máximo 1)                

                        ctx.beginPath();
                        ctx.arc(ex, ey, radarPowerUpRadius, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgb(0, 255, 34)';
                        ctx.globalAlpha = alpha;
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }        
                }
            }

            // --- Indicador de saída na borda do radar ---
            this.drawExitIndicator(ctx, radarX, radarY, radarRadius);

        
            ctx.restore(); // Fim do clipping
        }
        
        ctx.restore();
        ctx.restore(); // Fim do radar
            
        // --- Barra de bateria ao lado do radar ---               
        this.drawBattery(ctx);
    }

}