'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  direction?: number;
  health?: number;
  type?: 'player' | 'enemy' | 'laser' | 'explosion';
  createdAt?: number;
  enemyType?: 'rebel' | 'xwing' | 'ywing';
}

interface GameState {
  player: GameObject;
  lasers: GameObject[];
  enemies: GameObject[];
  explosions: GameObject[];
  score: number;
  gameOver: boolean;
  wave: number;
}

const GAME_CONFIG = {
  PLAYER_SPEED: 5,
  LASER_SPEED: 8,
  ENEMY_SPEED: 2,
  ENEMY_ROWS: 5,
  ENEMIES_PER_ROW: 11,
  ENEMY_SPACING: 50,
  ENEMY_DESCENT_SPEED: 0.5,
  SHOOT_COOLDOWN: 300,
  PLAYER_SIZE: { width: 40, height: 40 },
  ENEMY_SIZE: { width: 30, height: 30 },
  LASER_SIZE: { width: 3, height: 12 },
  EXPLOSION_DURATION: 500,
  WAVE_BONUS: 1000,
  ENEMY_MOVE_INTERVAL: 1000,
  ENEMY_SHOOT_CHANCE: 0.0005,
  MOVE_DOWN_DISTANCE: 20
};

const COLORS = {
  LASER_RED: '#FF0000',
  LASER_GREEN: '#00FF00',
  EXPLOSION: '#FFB300',
  SHIELD: '#4287f5',
  VADER: '#000000',
  REBEL: '#FF4444'
};

export default function Game({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: { x: 0, y: 0, width: GAME_CONFIG.PLAYER_SIZE.width, height: GAME_CONFIG.PLAYER_SIZE.height, health: 3 },
    lasers: [],
    enemies: [],
    explosions: [],
    score: 0,
    gameOver: false,
    wave: 1
  });
  const [displayScore, setDisplayScore] = useState(0);
  const [displayWave, setDisplayWave] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const keysRef = useRef({ left: false, right: false, space: false });
  const gameLoopRef = useRef<number>();
  const lastShotRef = useRef<number>(0);

  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Reset game state
    gameStateRef.current = {
      player: {
        x: canvas.width / 2 - GAME_CONFIG.PLAYER_SIZE.width / 2,
        y: canvas.height - GAME_CONFIG.PLAYER_SIZE.height - 20,
        width: GAME_CONFIG.PLAYER_SIZE.width,
        height: GAME_CONFIG.PLAYER_SIZE.height,
        health: 3,
        type: 'player'
      },
      lasers: [],
      enemies: [],
      explosions: [],
      score: 0,
      gameOver: false,
      wave: 1
    };

    // Initialize enemies in Space Invaders formation
    const enemies: GameObject[] = [];
    const enemyTypes: ('rebel' | 'xwing' | 'ywing')[] = ['ywing', 'xwing', 'xwing', 'rebel', 'rebel'];
    
    for (let row = 0; row < GAME_CONFIG.ENEMY_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.ENEMIES_PER_ROW; col++) {
        enemies.push({
          x: col * GAME_CONFIG.ENEMY_SPACING + (canvas.width - GAME_CONFIG.ENEMIES_PER_ROW * GAME_CONFIG.ENEMY_SPACING) / 2,
          y: row * 40 + 50,
          width: GAME_CONFIG.ENEMY_SIZE.width,
          height: GAME_CONFIG.ENEMY_SIZE.height,
          speed: GAME_CONFIG.ENEMY_SPEED * (1 + GAME_CONFIG.ENEMY_DESCENT_SPEED),
          direction: 1,
          health: 1,
          type: 'enemy',
          enemyType: enemyTypes[row % enemyTypes.length]
        });
      }
    }
    gameStateRef.current.enemies = enemies;
    setDisplayScore(0);
    setDisplayWave(1);
    setIsGameOver(false);
    setIsVictory(false);
  }, []);

  const startNewWave = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const state = gameStateRef.current;

    // Initialize enemies in Space Invaders formation
    const enemies: GameObject[] = [];
    const enemyTypes: ('rebel' | 'xwing' | 'ywing')[] = ['ywing', 'xwing', 'xwing', 'rebel', 'rebel'];
    
    for (let row = 0; row < GAME_CONFIG.ENEMY_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.ENEMIES_PER_ROW; col++) {
        enemies.push({
          x: col * GAME_CONFIG.ENEMY_SPACING + (canvas.width - GAME_CONFIG.ENEMIES_PER_ROW * GAME_CONFIG.ENEMY_SPACING) / 2,
          y: row * 40 + 50,
          width: GAME_CONFIG.ENEMY_SIZE.width,
          height: GAME_CONFIG.ENEMY_SIZE.height,
          speed: GAME_CONFIG.ENEMY_SPEED * (1 + state.wave * 0.2),
          direction: 1,
          health: 1,
          type: 'enemy',
          enemyType: enemyTypes[row % enemyTypes.length]
        });
      }
    }
    state.enemies = enemies;
    state.wave++;
    state.score += GAME_CONFIG.WAVE_BONUS;
    setDisplayScore(state.score);
    setDisplayWave(state.wave);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key.toLowerCase() === 'r' && (isGameOver || isVictory)) {
      setGameKey(prev => prev + 1);
    }
    keysRef.current = {
      ...keysRef.current,
      left: e.key === 'ArrowLeft' ? true : keysRef.current.left,
      right: e.key === 'ArrowRight' ? true : keysRef.current.right,
      space: e.key === ' ' ? true : keysRef.current.space
    };
    e.preventDefault();
  }, [onClose, isGameOver, isVictory]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current = {
      ...keysRef.current,
      left: e.key === 'ArrowLeft' ? false : keysRef.current.left,
      right: e.key === 'ArrowRight' ? false : keysRef.current.right,
      space: e.key === ' ' ? false : keysRef.current.space
    };
  }, []);

  const drawVader = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    // Draw Vader's helmet
    ctx.fillStyle = COLORS.VADER;
    
    // Helmet main shape
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + height * 0.8);
    ctx.lineTo(x + width * 0.8, y + height * 0.8);
    ctx.lineTo(x + width * 0.7, y + height * 0.4);
    ctx.lineTo(x + width * 0.6, y + height * 0.3);
    ctx.lineTo(x + width * 0.4, y + height * 0.3);
    ctx.lineTo(x + width * 0.3, y + height * 0.4);
    ctx.closePath();
    ctx.fill();

    // Helmet top
    ctx.beginPath();
    ctx.moveTo(x + width * 0.4, y + height * 0.3);
    ctx.lineTo(x + width * 0.6, y + height * 0.3);
    ctx.lineTo(x + width * 0.5, y + height * 0.1);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#444444';
    ctx.fillRect(x + width * 0.3, y + height * 0.4, width * 0.15, height * 0.15);
    ctx.fillRect(x + width * 0.55, y + height * 0.4, width * 0.15, height * 0.15);

    // Breathing apparatus
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + width * 0.4, y + height * 0.6, width * 0.2, height * 0.2);
  }, []);

  const drawEnemy = useCallback((ctx: CanvasRenderingContext2D, enemy: GameObject) => {
    const { x, y, width, height, enemyType } = enemy;
    ctx.fillStyle = COLORS.REBEL;

    switch (enemyType) {
      case 'rebel':
        // Rebel Alliance symbol
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'xwing':
        // Simplified X-Wing shape
        ctx.fillRect(x + width * 0.4, y, width * 0.2, height);
        ctx.fillRect(x, y + height * 0.3, width, height * 0.15);
        break;
      
      case 'ywing':
        // Simplified Y-Wing shape
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }, []);

  const drawExplosion = useCallback((ctx: CanvasRenderingContext2D, explosion: GameObject) => {
    ctx.fillStyle = COLORS.EXPLOSION;
    const progress = (Date.now() - explosion.createdAt!) / GAME_CONFIG.EXPLOSION_DURATION;
    const size = explosion.width * (1 - progress);
    ctx.beginPath();
    ctx.arc(explosion.x + explosion.width/2, explosion.y + explosion.height/2, size/2, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawGameState = useCallback((ctx: CanvasRenderingContext2D, state: GameState) => {
    // Draw player (Vader)
    drawVader(ctx, state.player.x, state.player.y, state.player.width, state.player.height);

    // Draw lasers
    state.lasers.forEach(laser => {
      ctx.fillStyle = laser.y < state.player.y ? COLORS.LASER_GREEN : COLORS.LASER_RED;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    });

    // Draw enemies
    state.enemies.forEach(enemy => {
      drawEnemy(ctx, enemy);
    });

    // Draw explosions
    state.explosions.forEach(explosion => {
      drawExplosion(ctx, explosion);
    });
  }, [drawVader, drawEnemy, drawExplosion]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    
    // Clear canvas
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw starfield background
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = (Math.random() * canvas.height + state.wave * 2) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    if (state.gameOver || isVictory) {
      // Draw final state
      drawGameState(ctx, state);
      return;
    }

    // Update player position
    if (keysRef.current.left) {
      state.player.x = Math.max(0, state.player.x - GAME_CONFIG.PLAYER_SPEED);
    }
    if (keysRef.current.right) {
      state.player.x = Math.min(canvas.width - state.player.width, state.player.x + GAME_CONFIG.PLAYER_SPEED);
    }

    // Fire lasers
    const now = Date.now();
    if (keysRef.current.space && now - lastShotRef.current > GAME_CONFIG.SHOOT_COOLDOWN) {
      state.lasers.push({
        x: state.player.x + state.player.width / 2 - GAME_CONFIG.LASER_SIZE.width / 2,
        y: state.player.y,
        width: GAME_CONFIG.LASER_SIZE.width,
        height: GAME_CONFIG.LASER_SIZE.height,
        type: 'laser',
        speed: -GAME_CONFIG.LASER_SPEED,
        createdAt: now
      });
      lastShotRef.current = now;
    }

    // Update lasers
    state.lasers = state.lasers
      .map(laser => ({ 
        ...laser, 
        y: laser.y + laser.speed!
      }))
      .filter(laser => {
        if (laser.y < -laser.height || laser.y > canvas.height) {
          return false;
        }
        
        if (laser.speed! > 0) {
          const hitPlayer = laser.x < state.player.x + state.player.width &&
                           laser.x + laser.width > state.player.x &&
                           laser.y < state.player.y + state.player.height &&
                           laser.y + laser.height > state.player.y;
          
          if (hitPlayer) {
            state.player.health!--;
            state.explosions.push({
              x: state.player.x,
              y: state.player.y,
              width: state.player.width,
              height: state.player.height,
              createdAt: Date.now(),
              type: 'explosion'
            });
            
            if (state.player.health! <= 0) {
              state.gameOver = true;
              setIsGameOver(true);
            }
            return false;
          }
        }
        
        return true;
      });

    // Update enemies
    let needsDirectionChange = false;
    const currentTime = Date.now();
    
    state.enemies.forEach(enemy => {
      // Horizontal movement only
      enemy.x += enemy.speed! * enemy.direction!;
      
      // Check for wall collision
      if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        needsDirectionChange = true;
      }
    });

    if (needsDirectionChange) {
      state.enemies.forEach(enemy => {
        enemy.direction! *= -1;
        enemy.y += GAME_CONFIG.MOVE_DOWN_DISTANCE; // Move down by fixed amount when hitting walls
      });
    }

    // Enemy shooting
    state.enemies.forEach(enemy => {
      if (Math.random() < GAME_CONFIG.ENEMY_SHOOT_CHANCE) {
        if (enemy.y > 0 && enemy.y < canvas.height) {
          state.lasers.push({
            x: enemy.x + enemy.width / 2 - GAME_CONFIG.LASER_SIZE.width / 2,
            y: enemy.y + enemy.height,
            width: GAME_CONFIG.LASER_SIZE.width,
            height: GAME_CONFIG.LASER_SIZE.height,
            type: 'laser',
            speed: GAME_CONFIG.LASER_SPEED,
            createdAt: Date.now()
          });
        }
      }
    });

    // Remove enemies that go off screen and count as escaped
    state.enemies = state.enemies.filter(enemy => {
      if (enemy.y > canvas.height) {
        state.player.health!--;  // Lose health when enemy reaches bottom
        if (state.player.health! <= 0) {
          state.gameOver = true;
          setIsGameOver(true);
        }
        return false;
      }
      return true;
    });

    // Update explosions
    state.explosions = state.explosions.filter(explosion => 
      Date.now() - explosion.createdAt! < GAME_CONFIG.EXPLOSION_DURATION
    );

    // Check collisions
    const playerLasers = state.lasers.filter(laser => laser.speed! < 0);
    playerLasers.forEach(laser => {
      state.enemies = state.enemies.filter(enemy => {
        const hit = laser.x < enemy.x + enemy.width &&
                   laser.x + laser.width > enemy.x &&
                   laser.y < enemy.y + enemy.height &&
                   laser.y + laser.height > enemy.y;
        if (hit) {
          state.score += 10 * state.wave;
          setDisplayScore(state.score);
          state.explosions.push({
            ...enemy,
            createdAt: Date.now(),
            type: 'explosion'
          });
          state.lasers = state.lasers.filter(l => l !== laser);
        }
        return !hit;
      });
    });

    // Enemy collision with player
    if (state.enemies.some(enemy => 
      enemy.x < state.player.x + state.player.width &&
      enemy.x + enemy.width > state.player.x &&
      enemy.y < state.player.y + state.player.height &&
      enemy.y + enemy.height > state.player.y
    )) {
      state.player.health!--;
      
      // Add explosion effect
      state.explosions.push({
        x: state.player.x,
        y: state.player.y,
        width: state.player.width,
        height: state.player.height,
        createdAt: Date.now(),
        type: 'explosion'
      });

      if (state.player.health! <= 0) {
        state.gameOver = true;
        setIsGameOver(true);
        return;
      }

      // Remove the colliding enemy
      state.enemies = state.enemies.filter(enemy => 
        !(enemy.x < state.player.x + state.player.width &&
          enemy.x + enemy.width > state.player.x &&
          enemy.y < state.player.y + state.player.height &&
          enemy.y + enemy.height > state.player.y)
      );
    }

    // Check if wave is complete
    if (state.enemies.length === 0) {
      if (state.wave >= 5) {
        setIsVictory(true);
        return;
      }
      startNewWave();
    }

    // Draw current game state
    drawGameState(ctx, state);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isVictory, startNewWave, drawGameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    initializeGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, initializeGame, gameLoop]);

  return (
    <div className="game-container" key={gameKey}>
      <div className="game-header">
        <div className="game-score">Score: {displayScore}</div>
        <div className="game-wave">Wave: {displayWave}/5</div>
        <div className="game-health">Shields: {gameStateRef.current.player.health}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      <div className="game-controls">
        Arrow Keys to Move | Space to Fire | ESC to Exit
        {(isGameOver || isVictory) && " | R to Restart"}
      </div>
      {(isGameOver || isVictory) && (
        <div className="game-over">
          {isVictory ? (
            <>
              The Force is Strong With You!
              <br />
              Final Score: {displayScore}
              <br />
              <span className="text-sm">(Press R to play again)</span>
            </>
          ) : (
            <>
              The Dark Side Prevails!
              <br />
              Final Score: {displayScore}
              <br />
              <span className="text-sm">(Press R to restart)</span>
            </>
          )}
        </div>
      )}
    </div>
  );
} 