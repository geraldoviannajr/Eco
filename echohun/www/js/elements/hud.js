class HUD extends Control {
    x = 30;
    y = 30;
    active = true;
    visible = true;
    radius = 25;
    constructor() { 
        super();
    }
                
    drawBag(ctx, percent, bagRadius) {
        // --- Indicador circular de mochila na borda do radar ---
        const bagX = this.x;
        const bagY = this.y;
                
        // Nível da mochila (0-100)
        const bagPercent = Math.max(0, Math.min(100, percent));
        
        // Ângulo base (começa do topo, sentido horário)
        const startAngle = -Math.PI / 2; // 12h (topo)
        const endAngle = startAngle + (2 * Math.PI * bagPercent / 100); // sentido horário
               
        // Círculo de fundo, representa os espaços livres
        ctx.beginPath();
        ctx.arc(bagX, bagY, bagRadius - 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgb(77, 77, 77)';
        ctx.lineWidth = 5;
        ctx.stroke();
       
        // Cor do arco ocupado
        let color = 'rgb(0, 250, 0)';
        
        // Arco da mochila (sentido horário)
        if (bagPercent > 0) {
            ctx.beginPath();
            ctx.arc(bagX, bagY, bagRadius - 1, startAngle, endAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        // Indicador de nível baixo (pisca quando <= 25%)
        if (bagPercent <= 25 && bagPercent > 0) {
            const time = window.game.gameTime * 0.005;
            const blinkAlpha = 0.3 + 0.4 * Math.abs(Math.sin(time * 3));
            ctx.beginPath();
            ctx.arc(bagX, bagY, bagRadius - 1, startAngle, endAngle);
            ctx.strokeStyle = `rgba(0,0,0,${blinkAlpha})`;
            ctx.lineWidth = 4;
            ctx.stroke();
        }                
    }

    drawMarker(ctx, centerX, centerY, angle, radius, length = 4) {
        const outer = radius + length;
        const inner = radius - length;
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



    draw = () => {
        super.draw();
        const ctx = window.game.ctx;
        const hpPercent = window.game.player.hp;
        const staminaPercent = window.game.player.stamina;         
        
        const centerX = this.x;
        const centerY = this.y;
        const radius = this.radius;
        const lineWidth = 5;
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
        this.drawMarker(ctx, centerX, centerY, Math.PI / 2, radius);

        // 12h (topo do arco)
        this.drawMarker(ctx, centerX, centerY, -Math.PI / 2, radius);

        // Marcador de 30% da stamina (posição relativa)
        this.drawMarker(ctx, centerX, centerY, stStart + thirtyPercentAngle, radius);        

        // === Mochila ===
        const bag = window.game.player.bag;
        const bagPercent = (bag.items.length * 100 / bag.maxItems);
        const bagRadius = this.radius - 5;
        this.drawBag(ctx, bagPercent, bagRadius);

        for (let i = 0; i < bag.maxItems; i++) {
            // Calcula o ângulo para cada marca (distribuído uniformemente)
            const angle = -Math.PI / 2 + (2 * Math.PI * i / bag.maxItems);
            this.drawMarker(ctx, centerX, centerY, angle, bagRadius-2, 3);
        }

               
        // === Texto de nível
        ctx.fillStyle = '#AEEEEE';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Lv', centerX, centerY - 6);
        ctx.fillText(window.game.map.level, centerX, centerY + 6);        



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