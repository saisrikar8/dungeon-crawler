import { EnemySprites } from './sprites.js';

const PIXEL_SIZE = 4;
const SPRITE_SCALE = PIXEL_SIZE * 8;

export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pixelX = x * SPRITE_SCALE;
        this.pixelY = y * SPRITE_SCALE;
        this.expression = 'neutral';
        this.hp = 2;
        this.maxHp = 2;
        this.alive = true;
        this.mode = 'patrol';
        this.patrolCooldown = 0;
        this.fleeTimer = 0;
        this.spriteOffsetY = 0;
        this.spriteReady = false;
        this.moveCooldown = 0;
        this.MOVE_COOLDOWN_TIME = 5;
    }

    updatePixelPosition() {
        const targetX = this.x * SPRITE_SCALE;
        const targetY = this.y * SPRITE_SCALE;
        this.pixelX += (targetX - this.pixelX) * 0.2;
        this.pixelY += (targetY - this.pixelY) * 0.2;
    }

    draw(ctx) {
        if (!this.alive) return;
        this.updatePixelPosition();
        const sprite = EnemySprites[this.expression] || EnemySprites.neutral;
        if (sprite && !this.spriteReady && sprite.complete) {
            this.spriteOffsetY = SPRITE_SCALE - sprite.height;
            this.spriteReady = true;
        }
        if (sprite) {
            ctx.drawImage(sprite, this.pixelX, this.pixelY + this.spriteOffsetY);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.pixelX, this.pixelY, SPRITE_SCALE, SPRITE_SCALE);
        }
    }

    takeDamage() {
        this.hp--;
        this.expression = 'hurt';
        if (this.hp <= 0) this.alive = false;
        setTimeout(() => {
            if (this.alive) this.expression = 'neutral';
        }, 500);
    }

    isTouchingPlayer(player) {
        return this.x === player.x && this.y === player.y;
    }

    canSeePlayer(player, maxSight = 5) {
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        return dx + dy <= maxSight;
    }

    moveTowardPlayer(map, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        let stepX = 0;
        let stepY = 0;
        if (Math.abs(dx) > Math.abs(dy)) stepX = dx > 0 ? 1 : -1;
        else if (dy !== 0) stepY = dy > 0 ? 1 : -1;

        const newX = this.x + stepX;
        const newY = this.y + stepY;

        if (map[newY]?.[newX] === 0 || map[newY]?.[newX] === 2 && this.moveCooldown === 0) {
            this.x = newX;
            this.y = newY;
            this.mode = 'chase';
            this.expression = 'angry';
            this.moveCooldown = this.MOVE_COOLDOWN_TIME;  // add cooldown here
        }
    }

    fleeFromPlayer(map, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        let stepX = 0;
        let stepY = 0;
        if (Math.abs(dx) > Math.abs(dy)) stepX = dx > 0 ? -1 : 1;
        else if (dy !== 0) stepY = dy > 0 ? -1 : 1;

        const newX = this.x + stepX;
        const newY = this.y + stepY;

        if (map[newY]?.[newX] === 0) {
            this.x = newX;
            this.y = newY;
            this.mode = 'flee';
            this.expression = 'hurt';
            this.fleeTimer = 30;
        }
    }

    patrol(map) {
        if (this.patrolCooldown > 0) {
            this.patrolCooldown--;
            return;
        }

        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];
        const valid = directions.filter(([dx, dy]) => {
            const nx = this.x + dx;
            const ny = this.y + dy;
            return map[ny]?.[nx] === 0;
        });
        if (valid.length > 0) {
            const [dx, dy] = valid[Math.floor(Math.random() * valid.length)];
            this.x += dx;
            this.y += dy;
            this.expression = 'neutral';
            this.patrolCooldown = Math.floor(Math.random() * 20) + 10;
        }
    }

    updateAI(map, player) {
        if (!this.alive) return;
        if (this.moveCooldown > 0) {
            this.moveCooldown--;
            return;  // skip movement decision if cooling down
        }
        if (this.hp <= 1) this.fleeFromPlayer(map, player);
        else if (this.canSeePlayer(player)) this.moveTowardPlayer(map, player);
        else this.patrol(map);
    }
}
