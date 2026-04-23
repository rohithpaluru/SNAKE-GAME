import React, { useRef, useEffect, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

type Point = { x: number; y: number };

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React state for UI
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Mutable refs for game loop to avoid dependency staleness
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Point>(INITIAL_DIRECTION);
  const nextDirectionRef = useRef<Point>(INITIAL_DIRECTION);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const reqRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const UPDATE_INTERVAL = 100; // ms between movements

  const generateFood = useCallback(() => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure the generated food isn't placed on the snake
      // eslint-disable-next-line no-loop-func
      isOccupied = snakeRef.current.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      foodRef.current = newFood;
    }
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = INITIAL_SNAKE;
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    generateFood();
  }, [generateFood]);

  const togglePause = useCallback(() => {
    if (gameOver) return;
    setIsPaused((p) => !p);
  }, [gameOver]);

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling defaults for arrow keys if game is focused/started
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (!gameStarted || gameOver) {
          resetGame();
        } else {
          togglePause();
        }
        return;
      }

      if (!gameStarted || isPaused || gameOver) return;

      const { x, y } = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isPaused, gameOver, resetGame, togglePause]);

  // Main Game Loop Update Logic
  const updateGame = useCallback(() => {
    const snake = snakeRef.current;
    
    // Apply queued direction
    directionRef.current = nextDirectionRef.current;
    const { x: dx, y: dy } = directionRef.current;
    
    const head = snake[0];
    const newHead = { x: head.x + dx, y: head.y + dy };

    // Wall collision checking
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Self collision checking
    if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // Food collision checking
    const food = foodRef.current;
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore((s) => {
        const newScore = s + 10;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
      generateFood();
    } else {
      newSnake.pop(); // Remove tail if no food eaten
    }

    snakeRef.current = newSnake;
  }, [highScore, generateFood]);

  // Canvas Drawing Logic
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board (make it transparent over the page background/canvas background)
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath();
      // vertical
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    const snake = snakeRef.current;
    const food = foodRef.current;

    // Draw snake (Start from tail to head so head is on top)
    for (let i = snake.length - 1; i >= 0; i--) {
      const segment = snake[i];

      // Block effect for snake
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#4ade80'; // green
      ctx.fillStyle = '#4ade80';

      // Slight padding
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    }

    // Draw Food
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f43f5e'; // pink 
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Reset shadow for performance
    ctx.shadowBlur = 0;

  }, []);

  // RAF Game Loop Frame orchestrator
  const tick = useCallback(
    (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;

      const elapsed = timestamp - lastUpdateRef.current;

      if (!gameOver && !isPaused && gameStarted) {
        if (elapsed > UPDATE_INTERVAL) {
          updateGame();
          lastUpdateRef.current = timestamp;
        }
      }
      
      // Always draw so particles/overlays/etc can still render if needed
      draw();
      
      reqRef.current = requestAnimationFrame(tick);
    },
    [gameOver, isPaused, gameStarted, updateGame, draw]
  );

  useEffect(() => {
    reqRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqRef.current);
  }, [tick]);


  return (
    <div className="flex flex-col justify-center items-center select-none font-mono w-full">
      <div className="relative w-full max-w-[480px]">
        
        {/* Top HUD */}
        <div className="absolute -top-[72px] left-0 right-0 flex justify-between items-end pb-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
            <span className="text-3xl font-mono neon-text-pink">{String(score).padStart(5, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">High Score</span>
            <span className="text-3xl font-mono text-white">{String(highScore).padStart(5, '0')}</span>
          </div>
        </div>

        {/* Game Canvas Container */}
        <div className="glass neon-border-green p-1 relative rounded-[16px]">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block max-w-full h-auto bg-black/30 rounded-[12px] w-full"
            style={{ 
              aspectRatio: '1/1'
            }}
          />

          {/* Overlays */}
          {(!gameStarted || gameOver || isPaused) && (
            <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md rounded-[12px] flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
              {!gameStarted && !gameOver && (
                <>
                  <h2 className="text-2xl font-black text-[#22d3ee] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] mb-4 tracking-tighter">
                    SYSTEM READY
                  </h2>
                  <p className="text-white opacity-80 mb-6 max-w-xs text-sm font-sans">
                    Use Arrow Keys or WASD to navigate.
                  </p>
                  <button 
                    onClick={resetGame}
                    className="px-6 py-2 glass font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                  >
                    Initialize
                  </button>
                </>
              )}

              {gameOver && (
                <>
                  <h2 className="text-3xl font-black neon-text-pink mb-2 tracking-tighter">
                    SYSTEM FAILURE
                  </h2>
                  <p className="text-white text-lg mb-6 tracking-widest">{String(score).padStart(5, '0')}</p>
                  <button 
                    onClick={resetGame}
                    className="px-6 py-2 glass font-bold text-[#f472b6] hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                  >
                    Reboot
                  </button>
                </>
              )}

              {isPaused && !gameOver && gameStarted && (
                <>
                  <h2 className="text-2xl font-black text-white mb-6 tracking-tighter">
                    PAUSED
                  </h2>
                  <button 
                    onClick={togglePause}
                    className="px-6 py-2 glass font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                  >
                    Resume
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
