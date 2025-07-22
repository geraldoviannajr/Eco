class Bag {
    items = []; // Lista de itens na mochila
    maxItems = 6; // Máximo de itens na mochila
    itemSpacing = 5; // Espaçamento entre itens
    itemPadding = 5; // Padding entre itens
    itemBorder = 2; // Borda dos itens
    constructor() { 
    }

    addItem(item) {
        if (this.items.length < this.maxItems) {
            this.items.push(item);
        }
    }

    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);     
        }
    }

    drawHighTechButton(ctx, x, y, text, width=0, height=0, options = {}) {
        ctx.save();
    
        // Cores e fonte
        const mainColor = options.mainColor || "#00FFF7";
        const borderColor = options.borderColor || "#0FF";
        const glowColor = options.glowColor || "rgba(0,255,247,0.5)";
        const font = options.font || "bold 12px 'Press Start 2P', 'Consolas', monospace";

        ctx.font = font;
        let dim = ctx.measureText(text);
        width = Math.max(width, dim.width + 30);
        height = Math.max(height, dim.actualBoundingBoxAscent + dim.actualBoundingBoxDescent + 25);        

        // Sombra/glow externo
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 16;
    
        // Desenha o corpo do botão (com recortes nos cantos)
        ctx.beginPath();
        const notch = 12;
        ctx.moveTo(x + notch, y);
        ctx.lineTo(x + width - notch, y);
        ctx.lineTo(x + width, y + notch);
        ctx.lineTo(x + width, y + height - notch);
        ctx.lineTo(x + width - notch, y + height);
        ctx.lineTo(x + notch, y + height);
        ctx.lineTo(x, y + height - notch);
        ctx.lineTo(x, y + notch);
        ctx.closePath();
    
        // Gradiente de fundo
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, "#0A1A1A");
        grad.addColorStop(1, "#1A3A3A");
        ctx.fillStyle = grad;
        ctx.fill();
    
        // Borda principal
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    
        // Borda interna neon
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + notch + 3, y + 3);
        ctx.lineTo(x + width - notch - 3, y + 3);
        ctx.lineTo(x + width - 3, y + notch + 3);
        ctx.lineTo(x + width - 3, y + height - notch - 3);
        ctx.lineTo(x + width - notch - 3, y + height - 3);
        ctx.lineTo(x + notch + 3, y + height - 3);
        ctx.lineTo(x + 3, y + height - notch - 3);
        ctx.lineTo(x + 3, y + notch + 3);
        ctx.closePath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = mainColor;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
    
        // Detalhes geométricos (linhas extras)
        ctx.save();
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x + width * 0.25, y + 6);
        ctx.lineTo(x + width * 0.75, y + 6);
        ctx.moveTo(x + width * 0.25, y + height - 6);
        ctx.lineTo(x + width * 0.75, y + height - 6);
        ctx.moveTo(x + 6, y + height * 0.25);
        ctx.lineTo(x + 6, y + height * 0.75);
        ctx.moveTo(x + width - 6, y + height * 0.25);
        ctx.lineTo(x + width - 6, y + height * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    
        // Texto centralizado
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = mainColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 10;
        ctx.fillText(text, x + width / 2, y + height / 2);
        ctx.restore();
    
        ctx.restore();
    }    

    drawTitle(ctx, x, y, text) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = "bold 20px 'Sans-Serif'"
        ctx.fillText(text + ":", x, y);
        ctx.restore();
    }

    drawText(ctx, x, y, text) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = "18px 'Sans-Serif'"
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawInventory(ctx) {
        // Dimensões e posição da janela
        const width = window.game.canvas.width - 50;
        const height = window.game.canvas.height - 50;
        var x = (ctx.canvas.width - width) / 2;
        var y = (ctx.canvas.height - height) / 2;
        const radius = 18;

        // Fundo modal com sombra
        ctx.save();        
        ctx.shadowColor = "rgba(128, 212, 233, 0.45)";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Barra de título
        const titleBarHeight = 44;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + titleBarHeight);
        ctx.lineTo(x, y + titleBarHeight);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 255, 136, 0.74)";
        ctx.globalAlpha = 0.98;
        ctx.shadowColor = "rgba(0,0,0,0.12)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Texto do título centralizado
        ctx.save();
        ctx.font = "bold 22px 'Press Start 2P', 'Consolas', monospace";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 4;
        ctx.fillText(window.game.language.getResource('inventory'), x + width / 2, y + titleBarHeight / 2 + 1);
        ctx.restore();                

        // Idioma
        this.drawTitle(ctx, x+10, y+titleBarHeight+20, window.game.language.getResource('level'));
        this.drawText(ctx, x+120, y+titleBarHeight+20, window.game.map.level);

        this.drawTitle(ctx, x+10, y+titleBarHeight+50, window.game.language.getResource('hp'));
        this.drawText(ctx, x+120, y+titleBarHeight+50, window.game.player.hp + " / " + window.game.player.maxHp);
        
        this.drawTitle(ctx, x+10, y+titleBarHeight+80, window.game.language.getResource('stamina'));
        this.drawText(ctx, x+120, y+titleBarHeight+80, window.game.player.stamina + " / " + window.game.player.maxStamina + " (" + window.game.language.getResource('cost') + ": " + window.game.player.staminaCost + ")");
        
        this.drawTitle(ctx, x+10, y+titleBarHeight+110, window.game.language.getResource('shield'));
        this.drawText(ctx, x+120, y+titleBarHeight+110, window.game.player.selectedShield ? window.game.player.selectedShield.name : window.game.language.getResource('none'));

        ctx.restore();
        
        /*
        // Informações do player
        const player = window.game.player;
        ctx.save();
        ctx.font = "16px Arial";
        ctx.fillStyle = "#FFF";
        ctx.textAlign = "left";
        let infoY = y + 70;
        ctx.fillText(`HP: ${player.hp} / ${player.maxHp}`, x + 32, infoY);
        infoY += 28;
        ctx.fillText(`Stamina: ${player.stamina} / ${player.maxStamina} (Custo: ${player.staminaCost || 0})`, x + 32, infoY);
        infoY += 28;
        ctx.fillText(`Escudo: ${player.selectedShield ? player.selectedShield.name : "Nenhum"}`, x + 32, infoY);
        ctx.restore();

        // Bag
        const bag = player.bag;
        const slotSize = 38;
        const slotsPerRow = 6;
        const bagX = x + 32;
        const bagY = y + height - 90;
        ctx.save();
        ctx.font = "bold 15px Arial";
        ctx.fillStyle = "#6EC6FF";
        ctx.fillText(`Mochila: ${bag.items.length} / ${bag.maxItems}`, bagX, bagY - 12);

        // Desenhar slots
        for (let i = 0; i < bag.maxItems; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            const slotX = bagX + col * (slotSize + 8);
            const slotY = bagY + row * (slotSize + 8);

            // Slot fundo
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#6EC6FF";
            ctx.fillStyle = "#222";
            ctx.rect(slotX, slotY, slotSize, slotSize);
            ctx.fill();
            ctx.stroke();

            // Item (nome ou ícone simples)
            if (bag.items[i]) {
                ctx.font = "13px Arial";
                ctx.fillStyle = "#FFD700";
                ctx.textAlign = "center";
                ctx.fillText(bag.items[i].name || "Item", slotX + slotSize / 2, slotY + slotSize / 2 + 5);
            }
        }
        */
        ctx.restore();
    }

}
