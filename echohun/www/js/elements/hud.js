class HUD {
    constructor() { }

    draw = () => {
        const ctx = window.game.ctx;
        const canvas = window.game.canvas;

        const hpPercent = window.game.player.hp;
        const staminaPercent = window.game.player.stamina; 
        const level = window.game.map.level;
        
        const centerX = 30;
        const centerY = 30;
        const radius = 18;
        const lineWidth = 5;

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

        // === Texto de nível
        ctx.fillStyle = '#AEEEEE';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Lv', centerX, centerY - 6);
        ctx.fillText(level, centerX, centerY + 6);

        // === Marcadores pretos ===
        function drawMarker(angle) {
            const outer = radius + 4;
            const inner = radius - 4;
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

        // 6h (divisor HP/Stamina)
        drawMarker(Math.PI / 2);

        // 12h (topo do arco)
        drawMarker(-Math.PI / 2);

        // Marcador de 30% da stamina (posição relativa)
        drawMarker(stStart + thirtyPercentAngle);

        
    }
}