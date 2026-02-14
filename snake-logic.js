const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

function key(point) {
  return `${point.x},${point.y}`;
}

function cellsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function foodFromRng(gridSize, snake, rng = Math.random) {
  const occupied = new Set(snake.map(key));
  const empty = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = { x, y };
      if (!occupied.has(key(cell))) {
        empty.push(cell);
      }
    }
  }

  if (empty.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * empty.length);
  return empty[index];
}

function nextHead(head, direction) {
  const delta = DIRECTIONS[direction];
  return { x: head.x + delta.x, y: head.y + delta.y };
}

function outOfBounds(head, gridSize) {
  return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
}

function blockedByBody(head, snake, willGrow) {
  const body = willGrow ? snake : snake.slice(0, -1);
  return body.some((segment) => cellsEqual(segment, head));
}

export function createInitialState(options = {}) {
  const gridSize = options.gridSize ?? 16;
  const start = { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) };
  const snake = [start];

  return {
    gridSize,
    snake,
    direction: 'right',
    nextDirection: 'right',
    food: foodFromRng(gridSize, snake, options.rng),
    score: 0,
    status: 'idle'
  };
}

export function setDirection(state, direction) {
  if (!DIRECTIONS[direction]) {
    return state;
  }

  const active = state.nextDirection || state.direction;
  if (OPPOSITE[active] === direction) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction,
    status: state.status === 'idle' ? 'running' : state.status
  };
}

export function togglePause(state) {
  if (state.status === 'running') {
    return { ...state, status: 'paused' };
  }

  if (state.status === 'paused') {
    return { ...state, status: 'running' };
  }

  return state;
}

export function restartState(state, options = {}) {
  return createInitialState({
    gridSize: options.gridSize ?? state.gridSize,
    rng: options.rng
  });
}

export function stepState(state, options = {}) {
  if (state.status !== 'running') {
    return state;
  }

  const direction = state.nextDirection || state.direction;
  const head = nextHead(state.snake[0], direction);

  if (outOfBounds(head, state.gridSize)) {
    return { ...state, direction, status: 'gameover' };
  }

  const willGrow = state.food && cellsEqual(head, state.food);
  if (blockedByBody(head, state.snake, willGrow)) {
    return { ...state, direction, status: 'gameover' };
  }

  const snake = [head, ...state.snake];
  if (!willGrow) {
    snake.pop();
  }

  if (!willGrow) {
    return {
      ...state,
      snake,
      direction,
      nextDirection: direction
    };
  }

  const food = foodFromRng(state.gridSize, snake, options.rng);
  return {
    ...state,
    snake,
    direction,
    nextDirection: direction,
    food,
    score: state.score + 1,
    status: food ? state.status : 'gameover'
  };
}

export const snakeLogic = {
  DIRECTIONS,
  createInitialState,
  setDirection,
  togglePause,
  restartState,
  stepState,
  foodFromRng
};
