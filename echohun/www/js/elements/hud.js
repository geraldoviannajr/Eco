class HUD extends Control {
    x = 30;
    y = 35;
    active = true;
    visible = true;
    radius = 30;
    constructor() { 
        super();
    }
                
    drawBag(ctx, centerX, centerY, percent, bagRadius) {
        // --- Indicador circular de mochila na borda do radar ---
        const bagX = centerX;
        const bagY = centerY;
                
        // Nível da mochila (0-100)
        const bagPercent = Math.max(0, Math.min(100, percent));
        
        // Ângulo base (começa do topo, sentido horário)
        const startAngle = -Math.PI / 2; // 12h (topo)
        const endAngle = startAngle + (2 * Math.PI * bagPercent / 100); // sentido horário
               
        // Círculo de fundo, representa os espaços livres
        ctx.beginPath();
        ctx.arc(bagX, bagY, bagRadius - 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgb(77, 77, 77)';
        ctx.lineWidth = (bagRadius * 0.2);
        ctx.stroke();
       
        // Cor do arco ocupado
        let color = 'rgb(0, 250, 0)';
        
        // Arco da mochila (sentido horário)
        if (bagPercent > 0) {
            ctx.beginPath();
            ctx.arc(bagX, bagY, bagRadius - 1, startAngle, endAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = (bagRadius * 0.2) -1;
            ctx.stroke();
        }            
    }

    drawMarker(ctx, centerX, centerY, angle, radius, width = 6) {
        const outer = radius + (width / 2);
        const inner = radius - (width / 2);
        const x1 = centerX + Math.cos(angle) * inner;
        const y1 = centerY + Math.sin(angle) * inner;
        const x2 = centerX + Math.cos(angle) * outer;
        const y2 = centerY + Math.sin(angle) * outer;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    draw = (_x = null, _y = null, _radius = null) => {
        super.draw();
        const ctx = window.game.ctx;
        const hpPercent = window.game.player.hp;
        const staminaPercent = window.game.player.stamina;         
        
        const centerX = _x != null ? _x : this.x;
        const centerY = _y != null ? _y : this.y;
        const radius = _radius != null ? _radius : this.radius;
        
        const lineWidth = radius * 0.2; // 20% do raio do HUD
        ctx.save();

        // === Fundo (opcional)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = lineWidth + 2;
        ctx.stroke();

        // === HP – metade esquerda (anti-horário)
        ctx.beginPath();
        const hpStart = Math.PI / 2;
        const hpEnd = hpStart - Math.PI * (hpPercent / 100);
        ctx.arc(centerX, centerY, radius, hpStart, hpEnd, true);
        ctx.strokeStyle = '#FF4C4C';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // === Stamina – metade direita (horário)
        const stStart = Math.PI / 2;
        const staminaAngle = Math.PI * (staminaPercent / 100);
        const staminaEnd = stStart + staminaAngle;

        const thirtyPercentAngle = Math.PI * (config.MIN_STAMINA_RUN / 100);

        // Parte laranja (até 30%)
        if (staminaPercent > 0) {
            ctx.beginPath();
            const endLaranja = Math.min(thirtyPercentAngle, staminaAngle);
            ctx.arc(centerX, centerY, radius, stStart, stStart + endLaranja);
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        // Parte amarela (acima de 30%)
        if (staminaPercent > config.MIN_STAMINA_RUN) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, stStart + thirtyPercentAngle, staminaEnd);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }


        // === Marcadores pretos ===
        // 6h (divisor HP/Stamina)
        this.drawMarker(ctx, centerX, centerY, Math.PI / 2, radius, lineWidth);

        // 12h (topo do arco)
        this.drawMarker(ctx, centerX, centerY, -Math.PI / 2, radius, lineWidth);

        // Marcador de 30% da stamina (posição relativa)
        this.drawMarker(ctx, centerX, centerY, stStart + thirtyPercentAngle, radius, lineWidth);        

        // === Mochila ===
        const bag = window.game.player.bag;
        const bagPercent = (bag.items.length * 100 / bag.maxItems);
        const bagRadius = radius - lineWidth;
        this.drawBag(ctx, centerX, centerY, bagPercent, bagRadius);

        for (let i = 0; i < bag.maxItems; i++) {
            // Calcula o ângulo para cada marca (distribuído uniformemente)
            const angle = -Math.PI / 2 + (2 * Math.PI * i / bag.maxItems);
            this.drawMarker(ctx, centerX, centerY, angle, bagRadius -1, lineWidth - 1);
        }

               
        // === Texto de nível
        ctx.fillStyle = '#AEEEEE';
        ctx.font = 'bold '+ Math.trunc(lineWidth * 2) +'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Lv', centerX, centerY - (lineWidth + 1));
        ctx.fillText(window.game.map.level, centerX, centerY + (lineWidth + 1));        


        ctx.restore();
    }

    click = () => {
        super.click();
        if (window.game.isPaused)
            window.game.resume();
        else
            window.game.pause();        
    }
}