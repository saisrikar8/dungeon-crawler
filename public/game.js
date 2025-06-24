import { generateMap, drawMap, TILE_SIZE } from './map.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { loadPlayerSprites, loadEnemySprites, PlayerSprites, EnemySprites } from './sprites.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const map = generateMap();
const player = new Player(1, 1);
let tick = 0;
let isGameOver = false;
let isAttacking = false;
const attackDuration = 15;
let attackTimer = 0;
let score = 0;

const keysPressed = new Set();
window.addEventListener('keydown', e => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    keysPressed.add(e.key);
});
window.addEventListener('keyup', e => keysPressed.delete(e.key));

let lastMoveTime = 0;
const MOVE_DELAY = 200;

function tryPlayerMove() {
    if (isGameOver) return;
    const now = performance.now();
    if (now - lastMoveTime < MOVE_DELAY) return;

    if (keysPressed.has("ArrowUp")) {
        player.move(0, -1, map);
        lastMoveTime = now;
    } else if (keysPressed.has("ArrowDown")) {
        player.move(0, 1, map);
        lastMoveTime = now;
    } else if (keysPressed.has("ArrowLeft")) {
        player.move(-1, 0, map);
        lastMoveTime = now;
    } else if (keysPressed.has("ArrowRight")) {
        player.move(1, 0, map);
        lastMoveTime = now;
    } else if (keysPressed.has(" ") && !isAttacking) {
        isAttacking = true;
        attackTimer = attackDuration;
        attackEnemies();
        lastMoveTime = now;
    }
}

function attackEnemies() {
    let hit = false;
    for (const e of enemies) {
        if (!e.alive) continue;
        const dx = Math.abs(e.x - player.x);
        const dy = Math.abs(e.y - player.y);
        if (dx <= 1 && dy <= 1 && (dx || dy)) {
            e.takeDamage();
            hit = true;
            break;
        }
    }
    if (hit) {
        player.expression = 'angry';
        setTimeout(() => player.hp > 0 && (player.expression = 'neutral'), 300);
    }
}

function showEndScreen(msg) {
    isGameOver = true;
    const overlay = document.getElementById('overlay');
    document.getElementById('message').innerHTML = `${msg}<br><small>Final Score: ${score}</small>`;
    overlay.classList.add('visible');
}

window.restartGame = () => location.reload();

function spawnEnemies(map, count) {
    const out = [];
    let placed = 0;
    while (placed < count) {
        const x = Math.floor(Math.random() * map[0].length);
        const y = Math.floor(Math.random() * map.length);
        if (map[y][x] === 0 && (x !== 1 || y !== 1) && Math.abs(x - 1) + Math.abs(y - 1) > 3) {
            out.push(new Enemy(x, y));
            placed++;
        }
    }
    return out;
}

function drawAttackRange(ctx, px, py) {
    ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            const x = px + dx, y = py + dy;
            if (x < 0 || y < 0 || y >= map.length || x >= map[0].length) continue;
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function updateUI() {
    document.getElementById('hp').textContent = player.hp;
    document.getElementById('enemies').textContent = enemies.filter(e => e.alive).length;
    document.getElementById('score').textContent = score;
}

const enemies = spawnEnemies(map, 4);

function gameLoop() {
    if (isGameOver) return;

    tryPlayerMove();
    updateUI();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx, map);
    player.draw(ctx);

    // Run AI decisions less often (every 30 ticks)
    if (tick % 5 === 0) {
        for (const e of enemies) {
            if (!e.alive) continue;
            e.updateAI(map, player);
        }
    }

    for (const e of enemies) {
        if (!e.alive) continue;
        e.updatePixelPosition();  // always update pixel position for smooth animation
        e.draw(ctx);

        if (e.isTouchingPlayer(player)) {
            player.takeDamage();
            if (player.hp <= 0) {
                showEndScreen('💀 Game Over! You were defeated.');
                return;
            }
            // Push enemy back if possible
            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const nx = e.x + Math.sign(dx);
            const ny = e.y + Math.sign(dy);
            if (map[ny]?.[nx] === 0) {
                e.x = nx;
                e.y = ny;
            }
        }
    }

    if (map[player.y][player.x] === 2) {
        const bonus = player.hp * 50 + enemies.filter(e => !e.alive).length * 100;
        score += bonus;
        showEndScreen("🎉 You escaped the dungeon!");
        return;
    }

    if (enemies.every(e => !e.alive)) {
        player.heal(1);
        score += 200;
    }

    if (isAttacking) {
        attackTimer--;
        drawAttackRange(ctx, player.x, player.y);
        if (attackTimer <= 0) isAttacking = false;
    }

    tick++;
    requestAnimationFrame(gameLoop);
}


async function startGame() {
    try {
        await Promise.all([loadPlayerSprites(), loadEnemySprites()]);
        updateUI();
        gameLoop();
    } catch (e) {
        console.error('Sprite load error:', e);
        alert('Error loading sprites.');
    }
}

startGame();
