import { PlayerSprites } from './sprites.js';
import { TILE_SIZE } from './map.js';

const PIXEL_SIZE = 4;
const SPRITE_SCALE = PIXEL_SIZE * 8;

export class Player {
    constructor(x, y, prop=null, skintone='f1c27d', clothes='0033cc') {
        this.x = x;
        this.y = y;
        this.pixelX = x * SPRITE_SCALE;
        this.pixelY = y * SPRITE_SCALE;
        this.expression = 'neutral';
        this.prop = prop;
        this.skintone = skintone;
        this.clothes=clothes;
        this.hp = 3;
        this.maxHp = 3;
        this.moving = false;
        this.spriteOffsetX = 0;
        this.spriteOffsetY = 0;
    }
    drawHealthBar(ctx) {
        const barWidth = 32;
        const barHeight = 5;
        const healthRatio = this.hp / this.maxHp;

        const barX = this.x*TILE_SIZE - 4;
        const barY = this.y*TILE_SIZE - barHeight - 10; // slightly above the character

        console.log(this.x, this.y, barX, barY, barWidth, barHeight, healthRatio);

        // Background (red)
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (green)
        ctx.fillStyle = "limegreen";
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

        // Border (optional)
        ctx.strokeStyle = "black";
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    updatePixelPosition() {
        const targetX = this.x * SPRITE_SCALE;
        const targetY = this.y * SPRITE_SCALE;
        const dx = targetX - this.pixelX;
        const dy = targetY - this.pixelY;
        this.pixelX += dx*0.3;
        this.pixelY += dy*0.3;
        if (Math.abs(dx) < 0.5) this.pixelX = targetX;
        if (Math.abs(dy) < 0.5) this.pixelY = targetY;
    }

    draw(ctx) {
        this.updatePixelPosition();
        const sprite = PlayerSprites[`${this.expression}-skin${this.skintone}-clothes${this.clothes}${this.prop ? '-' + this.prop : ''}`];

        if (sprite) {
            const offsetX = (SPRITE_SCALE - sprite.width) / 2;
            const offsetY = SPRITE_SCALE - sprite.height; // Align bottom of sprite to tile
            ctx.drawImage(sprite, this.pixelX + offsetX, this.pixelY + offsetY);
        } else {
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.pixelX, this.pixelY, SPRITE_SCALE, SPRITE_SCALE);
        }
        this.drawHealthBar(ctx)
    }

    move(dx, dy, map) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        if (
            newY < 0 ||
            newY >= map.length ||
            newX < 0 ||
            newX >= map[0].length
        ) return;
        if (map[newY][newX] === 0 || map[newY][newX] === 2) {
            this.x = newX;
            this.y = newY;
        }
    }

    takeDamage() {
        this.hp--;
        this.expression = 'hurt';
        setTimeout(() => {
            if (this.hp > 0) this.expression = 'neutral';
        }, 500);
    }

    heal(amount = 1) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.expression = 'happy';
        setTimeout(() => {
            this.expression = 'neutral';
        }, 500);
    }

    attack() {
        this.expression = 'angry';
        setTimeout(() => {
            if (this.hp > 0) this.expression = 'neutral';
        }, 300);
    }
}
