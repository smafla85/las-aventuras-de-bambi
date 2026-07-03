// ============================================
// LAS AVENTURAS DE BAMBI
// Sebastián debe rescatar a la princesa Pamela — 3 niveles
// Villanos: El Miedo, Las Dudas y EL PASADO
// Se vencen lanzando corazones de amor (ESPACIO)
// Gráficos: pack CC0 "Zelda-like" de ArMM1998 (ver assets/CREDITS.md)
// ============================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const SRC_TILE = 16;
const TILE = 32;
const COLS = 20;
const ROWS = 15;

// --- Carga de imágenes ---
const images = {};
function loadImage(name, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { images[name] = img; resolve(); };
    img.onerror = reject;
    img.src = src;
  });
}

// --- Entrada de teclado ---
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  // El navegador solo permite audio tras una interacción: aprovechamos cualquier tecla
  AudioSys.ensure();
  if (state === 'title') AudioSys.play('title');
  if (e.key.toLowerCase() === 'm') AudioSys.toggleMute();
  if (e.key === 'Enter') handleEnter();
  if (e.key === ' ') e.preventDefault();
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// ============================================
// NIVELES
// T = sólido (árbol/pared), . = suelo, P = sendero/alfombra,
// W = agua, f = flores, b = roca, S = estatua, E = salida,
// M = princesa Pamela
// ============================================
const LEVELS = [
  {
    name: 'Nivel 1 — El Bosque',
    theme: 'forest',
    start: { col: 9, row: 12 },
    intro: 'Para llegar hasta la princesa Pamela, Sebastián debe cruzar el bosque. Pero EL MIEDO custodia el camino del este... Venza al miedo lanzando corazones de amor con ESPACIO.',
    villain: { name: 'El Miedo', img: 'miedo', hp: 4, speed: 48, scale: 2.1, col: 16, row: 7,
      defeat: 'El Miedo se desvanece... Cuando el amor es más grande que el miedo, ningún camino da miedo recorrerlo. ♥' },
    decor: [
      { e: '🐎', c: 15, r: 12, s: 34 },
      { e: '🦋', c: 3, r: 2, s: 20, bob: true },
      { e: '🦋', c: 14, r: 13, s: 18, bob: true },
      { e: '💗', c: 6, r: 5, s: 20, bob: true },
      { e: '💗', c: 17, r: 4, s: 20, bob: true },
      { e: '🌷', c: 2, r: 9, s: 20 },
    ],
    map: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T..................T',
      'T..f....TT.....f...T',
      'T..PPPPPPPPPP......T',
      'T..PPPPPPPPPP..b...T',
      'T..PP......PP......T',
      'T..PP.WWWW.PP......T',
      'T.fPP.WWWW.PPPPPPPPE',
      'T..PP.WWWW.PPPPPPPPE',
      'T..PP......PP......T',
      'T..PPPPPPPPPP..TT..T',
      'T..PPPPPPPPPP..TT..T',
      'T..b....f..........T',
      'T...........f......T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
  },
  {
    name: 'Nivel 2 — La Cueva Oscura',
    theme: 'cave',
    start: { col: 2, row: 13 },
    intro: 'En la oscuridad de la cueva susurran LAS DUDAS: "¿y si no lo logra?"... Sebastián conoce la respuesta. Atraviese el laberinto y vénzalas con ESPACIO. La salida está al norte.',
    villain: { name: 'Las Dudas', img: 'dudas', hp: 6, speed: 62, scale: 2.2, col: 10, row: 3,
      defeat: 'Las Dudas se disipan... En el corazón de Sebastián nunca hubo pregunta: siempre fue ella. ♥' },
    decor: [
      { e: '✨', c: 2, r: 7, s: 18, bob: true },
      { e: '✨', c: 18, r: 6, s: 18, bob: true },
      { e: '✨', c: 5, r: 10, s: 16, bob: true },
      { e: '💎', c: 8, r: 12, s: 18 },
      { e: '💎', c: 12, r: 7, s: 18 },
      { e: '💗', c: 12, r: 4, s: 18, bob: true },
    ],
    map: [
      'TTTTTTTTTEETTTTTTTTT',
      'T..................T',
      'T.......S..S.......T',
      'T...TTT......TTT...T',
      'T...T..b..b....T...T',
      'T.b.T.TTTT.TTT.T...T',
      'T...T.T......T.T.b.T',
      'T.....T..bb..T.....T',
      'T.TTT.T......T.TT..T',
      'T.T...TTTTTT.T..T..T',
      'T.T.b........T..T..T',
      'T.TTTTTT.TTTTT..T..T',
      'T........T....b.T..T',
      'T..b.....T.........T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
  },
  {
    name: 'Nivel 3 — El Castillo',
    theme: 'castle',
    start: { col: 9, row: 13 },
    intro: 'La sala del trono. Pamela y su fiel perrita Sasha están tan cerca... pero el último guardián es EL PASADO, el más difícil de vencer: rápido, pesado y terco. No mire atrás, Sebastián: lance todo su amor con ESPACIO.',
    villain: { name: 'EL PASADO', img: 'pasado', hp: 10, speed: 78, scale: 2.4, col: 9, row: 6, dash: true,
      defeat: 'EL PASADO por fin descansa... Lo que fue ya no pesa. Lo que viene, brilla. ♥' },
    decor: [
      { e: '🌹', c: 5, r: 3, s: 22 },
      { e: '🌹', c: 14, r: 3, s: 22 },
      { e: '🕯️', c: 3, r: 2, s: 22 },
      { e: '🕯️', c: 16, r: 2, s: 22 },
      { e: '💗', c: 4, r: 7, s: 20, bob: true },
      { e: '💗', c: 15, r: 7, s: 20, bob: true },
      { e: '🦄', c: 16, r: 10, s: 34 },
      { e: '🐴', c: 3, r: 10, s: 30 },
      { e: '💗', c: 9, r: 12, s: 18, bob: true },
    ],
    map: [
      'TTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTTTTT',
      'T........M.........T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T......PPPPPP......T',
      'T..................T',
      'T..................T',
      'T..................T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
  },
];

// --- Estado global ---
let state = 'title'; // title | intro | playing | msg | win
let levelIndex = 0;
let level = LEVELS[0];
let pamela = null;
let villain = null;
let hearts = [];      // proyectiles de amor
let playerHp = 5;
const PLAYER_MAX_HP = 5;
let msgText = '';
let msgAfter = null;  // qué hacer al cerrar el mensaje
let time = 0;

function tileAt(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return 'T';
  return level.map[row][col] || '.';
}

function isSolid(col, row) {
  const t = tileAt(col, row);
  if (t === 'E' && villain && !villain.dead) return true; // la salida se abre al vencer al villano
  return 'TWSb'.includes(t);
}

function tileHash(col, row) {
  return ((col * 73856093) ^ (row * 19349663)) >>> 0;
}

function loadLevel(i) {
  levelIndex = i;
  level = LEVELS[i];
  player.x = level.start.col * TILE + 5;
  player.y = level.start.row * TILE + 12;
  player.dir = 'up';
  player.iframes = 0;
  player.shootCd = 0;
  playerHp = PLAYER_MAX_HP;
  hearts = [];
  pamela = null;
  villain = null;

  if (level.villain) {
    const v = level.villain;
    villain = {
      ...v,
      x: v.col * TILE + TILE / 2,
      y: v.row * TILE + TILE / 2,
      maxHp: v.hp,
      dead: false,
      hitFlash: 0,
      dashTimer: 0,
      dashing: 0,
    };
  }

  entitiesStatic = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tileAt(col, row);
      if (t === 'T' && level.theme === 'forest') {
        entitiesStatic.push({ baseline: row * TILE + TILE, draw: () => drawTree(col, row) });
      }
      if (t === 'S') {
        entitiesStatic.push({ baseline: row * TILE + TILE, draw: () => drawStatue(col, row) });
      }
      if (t === 'M') {
        pamela = { x: col * TILE + TILE / 2, y: row * TILE + TILE };
        entitiesStatic.push({ baseline: row * TILE + TILE, draw: drawPamela });
        entitiesStatic.push({ baseline: row * TILE + TILE, draw: drawSasha });
      }
    }
  }
  state = 'intro';
  AudioSys.play(level.theme);
}

function showMsg(text, after) {
  msgText = text;
  msgAfter = after || null;
  state = 'msg';
}

function handleEnter() {
  if (state === 'title') loadLevel(0);
  else if (state === 'intro') state = 'playing';
  else if (state === 'msg') {
    const after = msgAfter;
    msgAfter = null;
    state = 'playing';
    if (after) after();
  } else if (state === 'win') {
    state = 'title';
    AudioSys.play('title');
  }
}

// ============================================
// COORDENADAS EN LOS TILESETS
// ============================================
const T_GRASS = [0, 0];
const T_FLOWERS = [[0, 8], [1, 8]];
const T_ROCK = [7, 5];
const PATH_BLOCK = { col: 0, row: 3 };
const WATER_BLOCK = { col: 2, row: 6 };
const TREE = { x: 5 * SRC_TILE, y: 16 * SRC_TILE, w: 32, h: 32 };
const CAVE_FLOOR = [2, 1];
const CAVE_WALL_BLOCK = { col: 1, row: 3 };
const CAVE_BOULDER = [6, 4];
const STATUE = { x: 7 * SRC_TILE, y: 0, w: 16, h: 48 };
const IN_FLOOR = [2, 4];
const IN_WALL = [2, 1];
const CARPET_BLOCK = { col: 0, row: 7 };

function drawTile(img, sheetCol, sheetRow, dx, dy) {
  ctx.drawImage(img, sheetCol * SRC_TILE, sheetRow * SRC_TILE, SRC_TILE, SRC_TILE, dx, dy, TILE, TILE);
}

function drawAutoTile(img, block, types, col, row, x, y) {
  const up = !types.includes(tileAt(col, row - 1));
  const down = !types.includes(tileAt(col, row + 1));
  const left = !types.includes(tileAt(col - 1, row));
  const right = !types.includes(tileAt(col + 1, row));
  const sx = block.col + (left ? 0 : (right ? 2 : 1));
  const sy = block.row + (up ? 0 : (down ? 2 : 1));
  drawTile(img, sx, sy, x, y);
}

// ============================================
// JUGADOR (Sebastián)
// ============================================
const CHAR_W = 16, CHAR_H = 32;
const CHAR_DW = CHAR_W * 2, CHAR_DH = CHAR_H * 2;
const DIR_ROW = { down: 0, right: 1, up: 2, left: 3 };
const DIR_VEC = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

const player = {
  x: 0, y: 0,
  w: 22, h: 10,
  speed: 150,
  dir: 'down',
  moving: false,
  animTime: 0,
  iframes: 0,   // invulnerabilidad tras recibir daño
  shootCd: 0,   // recarga del lanzacorazones
};

function moveAxis(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  const corners = [
    [nx, ny], [nx + player.w, ny],
    [nx, ny + player.h], [nx + player.w, ny + player.h],
  ];
  for (const [cx, cy] of corners) {
    if (isSolid(Math.floor(cx / TILE), Math.floor(cy / TILE))) return;
  }
  player.x = nx;
  player.y = ny;
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys['w'] || keys['arrowup'])    { dy -= 1; player.dir = 'up'; }
  if (keys['s'] || keys['arrowdown'])  { dy += 1; player.dir = 'down'; }
  if (keys['a'] || keys['arrowleft'])  { dx -= 1; player.dir = 'left'; }
  if (keys['d'] || keys['arrowright']) { dx += 1; player.dir = 'right'; }

  player.moving = dx !== 0 || dy !== 0;

  if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

  moveAxis(dx * player.speed * dt, 0);
  moveAxis(0, dy * player.speed * dt);

  if (player.moving) player.animTime += dt;
  else player.animTime = 0;

  player.iframes = Math.max(0, player.iframes - dt);
  player.shootCd = Math.max(0, player.shootCd - dt);

  // Lanzar corazones de amor
  if (keys[' '] && player.shootCd <= 0) {
    const [vx, vy] = DIR_VEC[player.dir];
    hearts.push({
      x: player.x + player.w / 2,
      y: player.y - 14,
      vx: vx * 300,
      vy: vy * 300,
      life: 1.6,
    });
    player.shootCd = 0.35;
    AudioSys.sfx.shoot();
  }

  // ¿Pisamos una salida abierta?
  const centerCol = Math.floor((player.x + player.w / 2) / TILE);
  const centerRow = Math.floor((player.y + player.h / 2) / TILE);
  if (tileAt(centerCol, centerRow) === 'E') {
    AudioSys.sfx.exit();
    loadLevel(levelIndex + 1);
    return;
  }

  // ¿Llegamos con Pamela? (solo si EL PASADO fue vencido)
  if (pamela && (!villain || villain.dead)) {
    const dx2 = (player.x + player.w / 2) - pamela.x;
    const dy2 = (player.y + player.h) - pamela.y;
    if (Math.hypot(dx2, dy2) < 42) {
      showMsg('Sebastián: — Pamela... la voy a cuidar toda la vida y nunca la voy a soltar. ♥', () =>
        showMsg('Pamela lo abraza con fuerza. Y Sasha, la perrita negra, ladra de pura felicidad: ¡guau, guau!', () => {
          state = 'win';
          AudioSys.play('win');
        })
      );
    }
  }
}

function hurtPlayer() {
  if (player.iframes > 0) return;
  playerHp--;
  player.iframes = 1.2;
  AudioSys.sfx.hurt();
  // Empujón lejos del villano
  if (villain) {
    const ang = Math.atan2(player.y - villain.y, player.x - villain.x);
    moveAxis(Math.cos(ang) * 26, 0);
    moveAxis(0, Math.sin(ang) * 26);
  }
  if (playerHp <= 0) {
    showMsg('El amor nunca se rinde... ¡Inténtelo otra vez, Sebastián!', () => loadLevel(levelIndex));
  }
}

// ============================================
// VILLANOS (fantasmas: atraviesan paredes)
// ============================================
function updateVillain(dt) {
  if (!villain || villain.dead) return;

  villain.hitFlash = Math.max(0, villain.hitFlash - dt);

  // EL PASADO embiste periódicamente
  let speed = villain.speed;
  if (villain.dash) {
    villain.dashTimer += dt;
    if (villain.dashTimer > 2.6) { villain.dashing = 0.45; villain.dashTimer = 0; }
    if (villain.dashing > 0) { villain.dashing -= dt; speed *= 3.1; }
  }

  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const ang = Math.atan2(py - villain.y, px - villain.x);
  villain.x += Math.cos(ang) * speed * dt;
  villain.y += Math.sin(ang) * speed * dt;

  // ¿Tocó a Sebastián?
  if (Math.hypot(px - villain.x, py - villain.y) < 14 * villain.scale) hurtPlayer();
}

function updateHearts(dt) {
  for (const h of hearts) {
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.life -= dt;
    if (villain && !villain.dead &&
        Math.hypot(h.x - villain.x, h.y - (villain.y - 10 * villain.scale)) < 15 * villain.scale) {
      h.life = 0;
      villain.hp--;
      villain.hitFlash = 0.18;
      AudioSys.sfx.hitVillain();
      // Retrocede un poco al ser golpeado por el amor
      const ang = Math.atan2(villain.y - (player.y + player.h / 2), villain.x - (player.x + player.w / 2));
      villain.x += Math.cos(ang) * 22;
      villain.y += Math.sin(ang) * 22;
      if (villain.hp <= 0) {
        villain.dead = true;
        AudioSys.sfx.villainDown();
        showMsg(villain.defeat);
      }
    }
  }
  hearts = hearts.filter((h) => h.life > 0 && h.x > -20 && h.x < canvas.width + 20 && h.y > -20 && h.y < canvas.height + 20);
}

function drawVillain() {
  if (!villain || villain.dead) return;
  const img = images[villain.img];
  const bob = Math.sin(time * 3) * 4;
  const w = CHAR_W * villain.scale;
  const h = CHAR_H * villain.scale;
  const x = villain.x - w / 2;
  const y = villain.y - h + bob;

  // Hacia dónde mira (según el jugador)
  const dx = (player.x + player.w / 2) - villain.x;
  const dy = (player.y + player.h / 2) - villain.y;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  const frame = Math.floor(time * 5) % 4;

  ctx.save();
  ctx.globalAlpha = villain.hitFlash > 0 ? 0.45 : 0.82 + Math.sin(time * 2.2) * 0.1;
  ctx.drawImage(img, frame * CHAR_W, DIR_ROW[dir] * CHAR_H, CHAR_W, CHAR_H, x, y, w, h);
  ctx.restore();

  // Nombre y barra de vida
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(villain.x - 42, y - 26, 84, 22);
  ctx.fillStyle = '#ff9fc8';
  ctx.fillText(villain.name, villain.x, y - 11);
  ctx.fillStyle = '#33112a';
  ctx.fillRect(villain.x - 30, y - 2, 60, 5);
  ctx.fillStyle = '#ff5f9e';
  ctx.fillRect(villain.x - 30, y - 2, 60 * (villain.hp / villain.maxHp), 5);
  ctx.textAlign = 'left';
}

function drawHearts() {
  ctx.font = '20px serif';
  ctx.textAlign = 'center';
  for (const h of hearts) {
    ctx.fillText('💗', h.x, h.y + Math.sin(h.life * 20) * 2);
  }
  ctx.textAlign = 'left';
}

// ============================================
// SPRITES DE PERSONAJES
// ============================================
function drawSprite(img, dirKey, frame, cx, feetY) {
  const sx = frame * CHAR_W;
  const sy = DIR_ROW[dirKey] * CHAR_H;
  ctx.drawImage(img, sx, sy, CHAR_W, CHAR_H, cx - CHAR_DW / 2, feetY - CHAR_DH, CHAR_DW, CHAR_DH);
}

function drawPlayer() {
  // Parpadea mientras es invulnerable
  if (player.iframes > 0 && Math.floor(time * 12) % 2 === 0) return;
  const frame = player.moving ? (Math.floor(player.animTime * 8) % 4) : 0;
  drawSprite(images.character, player.dir, frame, player.x + player.w / 2, player.y + player.h);
}

function drawSasha() {
  // La perrita Sasha (negra, collar rosa), siempre junto a Pamela
  const bob = Math.sin(time * 4) * 2;
  ctx.drawImage(images.sasha, pamela.x + 24, pamela.y - 28 + bob, 28, 28);
}

function drawPamela() {
  const frame = Math.floor(time * 2) % 2 === 0 ? 0 : 2;
  drawSprite(images.pamela, 'down', frame, pamela.x, pamela.y);
  // Corazoncito flotando sobre Pamela cuando el camino está libre
  if (!villain || villain.dead) {
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💗', pamela.x, pamela.y - CHAR_DH - 6 + Math.sin(time * 3) * 3);
    ctx.textAlign = 'left';
  }
}

// ============================================
// ESCENARIO POR TEMA
// ============================================
let entitiesStatic = [];

function drawGroundForest() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tileAt(col, row);
      const x = col * TILE;
      const y = row * TILE;

      if (t === 'W') { drawAutoTile(images.overworld, WATER_BLOCK, 'W', col, row, x, y); continue; }
      if (t === 'P' || t === 'E') { drawAutoTile(images.overworld, PATH_BLOCK, 'PE', col, row, x, y); continue; }

      drawTile(images.overworld, T_GRASS[0], T_GRASS[1], x, y);
      if (t === 'f') {
        const [fc, fr] = T_FLOWERS[tileHash(col, row) % T_FLOWERS.length];
        drawTile(images.overworld, fc, fr, x, y);
      }
      if (t === 'b') drawTile(images.overworld, T_ROCK[0], T_ROCK[1], x, y);
    }
  }
}

function drawGroundCave() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tileAt(col, row);
      const x = col * TILE;
      const y = row * TILE;

      if (t === 'T') { drawAutoTile(images.cave, CAVE_WALL_BLOCK, 'T', col, row, x, y); continue; }

      drawTile(images.cave, CAVE_FLOOR[0], CAVE_FLOOR[1], x, y);
      if (t === 'b') drawTile(images.cave, CAVE_BOULDER[0], CAVE_BOULDER[1], x, y);
    }
  }
}

function drawGroundCastle() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tileAt(col, row);
      const x = col * TILE;
      const y = row * TILE;

      if (t === 'T') { drawTile(images.inner, IN_WALL[0], IN_WALL[1], x, y); continue; }
      if (t === 'P') { drawAutoTile(images.inner, CARPET_BLOCK, 'P', col, row, x, y); continue; }

      drawTile(images.inner, IN_FLOOR[0], IN_FLOOR[1], x, y);
    }
  }
}

function drawDecor() {
  if (!level.decor) return;
  ctx.textAlign = 'center';
  level.decor.forEach((d, i) => {
    ctx.font = d.s + 'px serif';
    const bob = d.bob ? Math.sin(time * 2 + i * 1.7) * 3 : 0;
    ctx.fillText(d.e, d.c * TILE + TILE / 2, d.r * TILE + TILE * 0.8 + bob);
  });
  ctx.textAlign = 'left';
}

function drawTree(col, row) {
  const x = col * TILE;
  const y = row * TILE;
  ctx.drawImage(images.overworld, TREE.x, TREE.y, TREE.w, TREE.h,
    x - TILE / 2, y + TILE - TREE.h * 2, TREE.w * 2, TREE.h * 2);
}

function drawStatue(col, row) {
  const x = col * TILE;
  const y = row * TILE;
  ctx.drawImage(images.cave, STATUE.x, STATUE.y, STATUE.w, STATUE.h,
    x, y + TILE - STATUE.h * 2, STATUE.w * 2, STATUE.h * 2);
}

function drawHud() {
  // Nombre del nivel
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(8, 8, ctx.measureText(level.name).width + 16, 26);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(level.name, 16, 26);

  // Vidas de Sebastián
  ctx.font = '18px serif';
  for (let i = 0; i < PLAYER_MAX_HP; i++) {
    ctx.globalAlpha = i < playerHp ? 1 : 0.22;
    ctx.fillText('❤️', canvas.width - 130 + i * 24, 28);
  }
  ctx.globalAlpha = 1;

  // Recordatorio de control
  if (villain && !villain.dead) {
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('ESPACIO: lanzar corazones 💗', 12, canvas.height - 10);
  }
}

function drawScene() {
  if (level.theme === 'forest') drawGroundForest();
  else if (level.theme === 'cave') drawGroundCave();
  else drawGroundCastle();

  drawDecor();

  const entities = entitiesStatic.slice();
  entities.push({ baseline: player.y + player.h, draw: drawPlayer });
  if (villain && !villain.dead) {
    entities.push({ baseline: villain.y, draw: drawVillain });
  }
  entities.sort((a, b) => a.baseline - b.baseline);
  entities.forEach((e) => e.draw());

  drawHearts();
  drawHud();
}

// ============================================
// PANTALLAS (título, cajas de texto, victoria)
// ============================================
function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
  return y;
}

function drawTitle() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Corazones flotando de fondo
  ctx.font = '18px serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 10; i++) {
    const fx = (i * 137 + 40) % canvas.width;
    const fy = (canvas.height + 40 - ((time * (18 + i * 4) + i * 97) % (canvas.height + 80)));
    ctx.fillText('💗', fx, fy);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 42px monospace';
  ctx.fillText('Las Aventuras', canvas.width / 2, 120);
  ctx.fillText('de Bambi', canvas.width / 2, 170);

  ctx.fillStyle = '#aaaacc';
  ctx.font = '16px monospace';
  ctx.fillText('Sebastián al rescate de la princesa Pamela', canvas.width / 2, 212);
  ctx.fillStyle = '#ff9fc8';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('♥ Hecho con amor, para usted ♥', canvas.width / 2, 240);

  ctx.drawImage(images.character, 0, 0, CHAR_W, CHAR_H, canvas.width / 2 - 90, 275, 64, 128);
  ctx.drawImage(images.pamela, 0, 0, CHAR_W, CHAR_H, canvas.width / 2 + 26, 275, 64, 128);
  ctx.drawImage(images.sasha, canvas.width / 2 + 100, 367, 36, 36);

  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Presione ENTER para comenzar', canvas.width / 2, 445);
  }
  ctx.textAlign = 'left';
}

function drawTextBox(title, text) {
  const boxY = canvas.height - 130;
  ctx.fillStyle = 'rgba(10,10,25,0.88)';
  ctx.fillRect(20, boxY, canvas.width - 40, 110);
  ctx.strokeStyle = '#ffe9a8';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, boxY + 4, canvas.width - 48, 102);

  let textY = boxY + 28;
  if (title) {
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(title, 40, boxY + 28);
    textY = boxY + 52;
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  wrapText(text, 40, textY, canvas.width - 80, 19);

  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = '#aaaacc';
    ctx.font = '13px monospace';
    ctx.fillText('ENTER para continuar ▶', canvas.width - 240, boxY + 98);
  }
}

function drawWin() {
  drawScene();
  ctx.fillStyle = 'rgba(10,10,25,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lluvia de corazones
  ctx.font = '22px serif';
  ctx.textAlign = 'center';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 14; i++) {
    const fx = (i * 103 + 60) % canvas.width;
    const fy = (canvas.height + 40 - ((time * (22 + i * 5) + i * 71) % (canvas.height + 80)));
    ctx.fillText(i % 3 === 0 ? '💖' : '💗', fx, fy);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#ff8fc0';
  ctx.font = 'bold 32px monospace';
  ctx.fillText('♥ ¡Sebastián rescató a Pamela! ♥', canvas.width / 2, 130);

  ctx.drawImage(images.character, 0, 32, CHAR_W, CHAR_H, canvas.width / 2 - 74, 170, 64, 128);
  ctx.drawImage(images.pamela, 0, 96, CHAR_W, CHAR_H, canvas.width / 2 + 10, 170, 64, 128);
  ctx.drawImage(images.sasha, canvas.width / 2 + 88, 258, 40, 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = '15px monospace';
  ctx.fillText('Venció al Miedo, a las Dudas y al Pasado.', canvas.width / 2, 336);
  ctx.fillStyle = '#ff9fc8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('Porque el amor puede con todo.', canvas.width / 2, 362);
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  ctx.fillText('Y junto a Sasha, vivieron felices para siempre.', canvas.width / 2, 386);

  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('FIN', canvas.width / 2, 415);
  ctx.fillStyle = '#aaaacc';
  ctx.font = '14px monospace';
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillText('ENTER para volver al título', canvas.width / 2, 450);
  }
  ctx.textAlign = 'left';
}

// ============================================
// BUCLE PRINCIPAL
// ============================================
let lastTime = 0;

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  time += dt;

  if (state === 'title') {
    drawTitle();
  } else if (state === 'intro') {
    drawScene();
    drawTextBox(level.name, level.intro);
  } else if (state === 'msg') {
    drawScene();
    drawTextBox(null, msgText);
  } else if (state === 'playing') {
    updatePlayer(dt);
    if (state === 'playing') {
      updateVillain(dt);
      updateHearts(dt);
    }
    if (state === 'win') drawWin();
    else if (state === 'msg') { drawScene(); drawTextBox(null, msgText); }
    else if (state === 'intro') { drawScene(); drawTextBox(level.name, level.intro); }
    else drawScene();
  } else if (state === 'win') {
    drawWin();
  }

  requestAnimationFrame(gameLoop);
}

Promise.all([
  loadImage('character', 'assets/character.png'),
  loadImage('pamela', 'assets/pamela.png'),
  loadImage('sasha', 'assets/sasha.png'),
  loadImage('miedo', 'assets/miedo.png'),
  loadImage('dudas', 'assets/dudas.png'),
  loadImage('pasado', 'assets/pasado.png'),
  loadImage('overworld', 'assets/Overworld.png'),
  loadImage('cave', 'assets/cave.png'),
  loadImage('inner', 'assets/Inner.png'),
]).then(() => {
  // Depuración: abrir con ?lvl=N para saltar directo a un nivel
  const lvl = new URLSearchParams(location.search).get('lvl');
  if (lvl !== null) { loadLevel(Number(lvl)); state = 'playing'; }
  requestAnimationFrame(gameLoop);
}).catch(() => {
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText('Error cargando los sprites (assets/)', 20, 40);
});
