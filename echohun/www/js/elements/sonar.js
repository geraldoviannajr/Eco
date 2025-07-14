class Sonar {
    x = 90;
    y = 30;
    active = false;
    visible = false;
    radius = 22;      // Raio visual do radar (em pixels)
    range = 0;      // Raio de atuação do radar (em unidades do jogo)
    constructor() { }

    draw = () => {
        if (!this.visible) return;

        if (this.range == 0) {
            this.range = game.canvas.width;
        }
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

        // --- Círculo de contorno do radar ---
        ctx.beginPath();
        ctx.arc(radarX, radarY, radarRadius, 0, Math.PI * 2);
        ctx.strokeStyle = (this.active ? "#FFD700" : "#ffd90052");
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- Linhas de escala internas ---
        ctx.setLineDash([3, 5]);
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(radarX, radarY, (radarRadius / 3) * i, 0, Math.PI * 2);
            ctx.strokeStyle = (this.active ? "#ffd900c7" : "#362e0142");
            ctx.lineWidth = 0.3;
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Desenha até aqui se não estiver ativo;
        if (!this.active) {
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
            const time = performance.now() * 0.001;
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
            ctx.arc(radarX, radarY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#636363ff";
            ctx.fill();

            // --- INDICADOR DE PÂNICO ---
            // Se o player sofreu dano recentemente, pisca o fundo do radar em vermelho
            if (game.player._lastSuffering && (Date.now() - game.player._lastSuffering < 800)) {
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

            ctx.restore(); // Fim do clipping
        }
        ctx.restore(); // Fim do radar
    }
}