import { generateMap, drawMap, TILE_SIZE } from './map.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { loadPlayerSprites, loadEnemySprites, PlayerSprites, EnemySprites } from './sprites.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

//Getting game params from url
const urlparams = new URLSearchParams(window.location.search);
const skin = urlparams.get('skin');
const clothes = urlparams.get('clothes');
const prop = urlparams.get('prop');
const difficulty = urlparams.get('difficulty');

const map = generateMap();
const player = new Player(1, 1, (prop==='none')?null:(prop), skin, clothes);
let tick = 0;
let isGameOver = false;
let score = 0;
const TICK_DELAY = (difficulty==='EASY')?35:(difficulty==='MEDIUM')?20:10;

let fireballs = [];
const FIREBALL_SPEED = 0.1;
const FIREBALL_RANGE = 1.5;
const FIREBALL_RADIUS = 4;


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
    } else if (keysPressed.has(" ")) {
        tryFireball();
        lastMoveTime = now;
    }
}

function launchFireballAt(enemy) {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const vx = (dx / dist) * FIREBALL_SPEED;
    const vy = (dy / dist) * FIREBALL_SPEED;

    fireballs.push({
        x: player.x + 0.5,
        y: player.y + 0.5,
        vx,
        vy,
        range: FIREBALL_RANGE,
        traveled: 0
    });
}

function tryFireball() {
    for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= FIREBALL_RANGE) {
            launchFireballAt(e);
            break;
        }
    }
}

function updateFireballs() {
    const newFireballs = [];

    for (const fb of fireballs) {
        fb.x += fb.vx;
        fb.y += fb.vy;
        fb.traveled += Math.sqrt(fb.vx * fb.vx + fb.vy * fb.vy);

        const tileX = Math.floor(fb.x);
        const tileY = Math.floor(fb.y);

        if (map[tileY]?.[tileX] === 1) continue;

        for (const e of enemies) {
            if (!e.alive) continue;
            if (Math.abs(e.x + 0.5 - fb.x) < 0.4 && Math.abs(e.y + 0.5 - fb.y) < 0.4) {
                e.takeDamage();
                if (!e.alive){
                    score += 100;
                    player.heal(1);
                }
                continue;
            }
        }

        if (fb.traveled < fb.range) {
            newFireballs.push(fb);
        }
    }

    fireballs = newFireballs;
}

function drawFireballs(ctx) {
    for (const fb of fireballs) {
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.arc(fb.x * TILE_SIZE, fb.y * TILE_SIZE, FIREBALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFireballRange() {
    ctx.beginPath();
    ctx.arc((player.x + 0.5) * TILE_SIZE, (player.y + 0.5) * TILE_SIZE, FIREBALL_RANGE * TILE_SIZE, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
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
            out.push(new Enemy(x, y, difficulty));
            placed++;
        }
    }
    return out;
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
    updateFireballs();
    updateUI();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap(ctx, map);
    drawFireballRange();
    player.draw(ctx);
    drawFireballs(ctx);

    if (tick % TICK_DELAY === 0) {
        for (const e of enemies) {
            if (!e.alive) continue;
            e.updateAI(map, player);
        }
    }

    for (const e of enemies) {
        if (!e.alive) continue;
        e.draw(ctx);
        if (e.isTouchingPlayer(player)) {
            player.takeDamage();
            if (player.hp <= 0) {
                showEndScreen('💀 Game Over! You were defeated.');
                return;
            }
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
        const bonus = player.hp * 30;
        score += bonus;
        showEndScreen("🎉 You escaped the dungeon!");
        return;
    }
    tick++;
    if (!isGameOver) requestAnimationFrame(gameLoop);
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
