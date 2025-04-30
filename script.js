// DOM Elements
const body = document.body;
const welcomeScreen = document.getElementById('welcome-screen');
const startGameBtn = document.getElementById('start-game-btn');
const howWhatBtn = document.getElementById('how-what-btn');
const exitBtn = document.getElementById('exit-btn');
const marketplaceBtn = document.getElementById('marketplace-btn');
const keyboardShortcutsBtn = document.getElementById('keyboard-shortcuts-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const backgroundVideo = document.querySelector('.background-video');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('play-pause');
const resetBtn = document.getElementById('reset');
const randomizeBtn = document.getElementById('randomize');
const speedSlider = document.getElementById('speed-slider');
const backToMenuBtn = document.getElementById('back-to-menu');
const howWhatModal = document.getElementById('how-what-modal');
const keyboardShortcutsModal = document.getElementById('keyboard-shortcuts-modal');
const closeBtns = document.querySelectorAll('.close-btn');
const marketplace = document.getElementById('marketplace');
const backFromMarketplaceBtn = document.getElementById('back-from-marketplace');
const decreaseCellsBtn = document.getElementById('decrease-cells');
const increaseCellsBtn = document.getElementById('increase-cells');

// Game Variables
let grid = [];
let cellSize = 15;
let cols, rows;
let isRunning = false;
let animationId;
let speed = 100; // milliseconds between updates
let isDarkTheme = true;

// Initialize the canvas size
function initCanvas() {
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.7;
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    createGrid();
    draw();
}

// Create empty grid
function createGrid() {
    grid = new Array(cols);
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows).fill(false);
    }
}

// Draw the grid
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background color based on theme
    if (isDarkTheme) {
        ctx.fillStyle = '#000';
    } else {
        ctx.fillStyle = '#fff';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw cells
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j]) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
            } else if (!isDarkTheme) {
                // Draw grid lines in light theme
                ctx.strokeStyle = '#ddd';
                ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}
function areEqual(matrix1 , matrix2){
    for (let i = 0; i < matrix1.length; i++) {
        for (let j = 0; j < matrix1[0].length; j++) {
            if (matrix1[i][j] !== matrix2[i][j]) {
                return false;
            }
        }
    }
    return true;
}
// Update the grid according to Conway's Game of Life rules
function update() {
    const next = new Array(cols);
    for (let i = 0; i < cols; i++) {
        next[i] = new Array(rows).fill(false);
    }

    // Compute next generation
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const state = grid[i][j];
            let neighbors = countNeighbors(i, j);

            if (state && (neighbors < 2 || neighbors > 3)) {
                next[i][j] = false; // Underpopulation or Overpopulation
            } else if (state && (neighbors === 2 || neighbors === 3)) {
                next[i][j] = true; // Survival
            } else if (!state && neighbors === 3) {
                next[i][j] = true; // Reproduction
            }
        }
    }

    if(!areEqual(grid, next)){
        let a = new Audio('pop.mp3');
        a.play();
    }

    grid = next;
}

// Count neighbors with edge looping
function countNeighbors(x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) continue;
            
            // Handle edge wrapping
            const col = (x + i + cols) % cols;
            const row = (y + j + rows) % rows;
            
            sum += grid[col][row] ? 1 : 0;
        }
    }
    return sum;
}

// Handle mouse clicks to toggle cells
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const i = Math.floor(mouseX / cellSize);
    const j = Math.floor(mouseY / cellSize);
    
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
        grid[i][j] = !grid[i][j];
        draw();
    }
}

// Game loop
function gameLoop() {
    if (!isRunning) return;
    
    update();
    draw();
    
    setTimeout(() => {
        animationId = requestAnimationFrame(gameLoop);
    }, speed);
}

// Randomize the grid
function randomizeGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() > 0.7;
        }
    }
    draw();
}

// Reset the grid
function resetGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = false;
        }
    }
    draw();
}

// Toggle play/pause
function togglePlayPause() {
    isRunning = !isRunning;
    playPauseBtn.textContent = isRunning ? 'Stop' : 'Start';
    
    if (isRunning) {
        gameLoop();
    } else {
        cancelAnimationFrame(animationId);
    }
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        body.classList.remove('light-theme');
        themeToggleBtn.textContent = 'Light Theme';
    } else {
        body.classList.add('light-theme');
        themeToggleBtn.textContent = 'Dark Theme';
    }
    draw();
}

// Adjust cell size and redraw grid
function adjustCellSize(delta) {
    const newSize = cellSize + delta;
    if (newSize >= 5 && newSize <= 50) {
        // Save current state with sizes proportional
        const oldCols = cols;
        const oldRows = rows;
        const oldGrid = [...grid];
        
        cellSize = newSize;
        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);
        
        // Create new grid
        createGrid();
        
        // Copy old grid to new grid with best fit
        for (let i = 0; i < Math.min(cols, oldCols); i++) {
            for (let j = 0; j < Math.min(rows, oldRows); j++) {
                if (i < oldCols && j < oldRows) {
                    grid[i][j] = oldGrid[i][j];
                }
            }
        }
        
        draw();
    }
}

// Event Listeners
startGameBtn.addEventListener('click', () => {
    welcomeScreen.style.transform = 'translateY(-100%)';
    backgroundVideo.style.display = 'none'; // Hide background video
});

howWhatBtn.addEventListener('click', () => {
    howWhatModal.style.display = 'flex';
});

keyboardShortcutsBtn.addEventListener('click', () => {
    keyboardShortcutsModal.style.display = 'flex';
});

exitBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to exit?')) {
        window.close();
        // Fallback if window.close() is blocked
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><h1>Thank you for playing!</h1></div>';
    }
});

marketplaceBtn.addEventListener('click', () => {
    marketplace.style.display = 'block';
});

backFromMarketplaceBtn.addEventListener('click', () => {
    marketplace.style.display = 'none';
});

themeToggleBtn.addEventListener('click', toggleTheme);

closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        this.parentElement.parentElement.style.display = 'none';
    });
});

canvas.addEventListener('click', handleCanvasClick);

playPauseBtn.addEventListener('click', togglePlayPause);

resetBtn.addEventListener('click', resetGrid);

randomizeBtn.addEventListener('click', randomizeGrid);

speedSlider.addEventListener('input', () => {
    speed = 200 - (speedSlider.value * 10);
});

backToMenuBtn.addEventListener('click', () => {
    isRunning = false;
    cancelAnimationFrame(animationId);
    playPauseBtn.textContent = 'Start';
    welcomeScreen.style.transform = 'translateY(0)';
    backgroundVideo.style.display = 'block'; // Show background video again
});

decreaseCellsBtn.addEventListener('click', () => adjustCellSize(5));
increaseCellsBtn.addEventListener('click', () => adjustCellSize(-5));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (welcomeScreen.style.transform === 'translateY(-100%)') {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlayPause();
        } else if (e.code === 'KeyR') {
            randomizeGrid();
        } else if (e.code === 'KeyC') {
            resetGrid();
        } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
            adjustCellSize(-5);
        } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
            adjustCellSize(5);
        } else if (e.code === 'Escape') {
            isRunning = false;
            cancelAnimationFrame(animationId);
            playPauseBtn.textContent = 'Start';
            welcomeScreen.style.transform = 'translateY(0)';
            backgroundVideo.style.display = 'block'; // Show background video again
        } else if (e.code === 'KeyT') {
            toggleTheme();
        }
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    // Save current state
    const oldGrid = [...grid];
    const oldCols = cols;
    const oldRows = rows;
    
    // Update canvas dimensions
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.7;
    cols = Math.floor(canvas.width / cellSize);
    rows = Math.floor(canvas.height / cellSize);
    
    // Create new grid
    createGrid();
    
    // Copy old grid to new grid with best fit
    for (let i = 0; i < Math.min(cols, oldCols); i++) {
        for (let j = 0; j < Math.min(rows, oldRows); j++) {
            if (i < oldCols && j < oldRows) {
                grid[i][j] = oldGrid[i][j];
            }
        }
    }
    
    draw();
});

// Set initial theme button text
themeToggleBtn.textContent = 'Light Theme';

// Initialize on load
window.onload = initCanvas;