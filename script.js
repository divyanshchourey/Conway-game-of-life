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
let currentInput = "";

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

document.addEventListener('keydown', function(event){
    if(event.key === 'R' || event.key === 'r'){
        console.log("r is pressed");
        randomizeGrid();
    }if(event.key === 'C' || event.key === 'c'){
        console.log("c is pressed");
        resetGrid();
    }
    let key = event.key.toLowerCase();
    currentInput += key; 
    console.log(currentInput);

    if(event.shiftKey){
        console.log("input cleared");
        currentInput = "";
    }else if(currentInput === "11"){
        //glider
        drawPattern(
            "bo$2bo$3o!"
        );
        currentInput="";
        return;
    }else if(currentInput === "12"){
        //Lightweight Spaceship
        drawPattern("b2o$o2bo$2obo$b2o!");
        currentInput = "";
        return;
    }else if(currentInput === "13"){
        //Gosper Glider Gun
        drawPattern("24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!");
        currentInput="";
        return;
    }else if(currentInput === "14"){
        //Pulsar
        drawPattern("6b2o$6b2o3$2o6b2o$2o6b2o3$6b2o$6b2o3$2o6b2o$2o6b2o!");
        currentInput="";
        return;
    }else if(currentInput === "15"){
        //R-Pentomino
        drawPattern("b2o$2o$bo!");
        currentInput="";
        return;
    }else if(currentInput === "16"){
        //Acorn
        drawPattern("bo5b$3bo3b$2o2b3o!");
        currentInput="";
        return;
    }else if(currentInput === "17"){
        //Beehive
        drawPattern("b2o$o2bo$b2o!");
        currentInput="";
        return;
    }else if(currentInput === "18"){
        //Diehard
        drawPattern("6bo$2b3o$3o2b2o!");
        currentInput="";
        return;
    }else if(currentInput === "19"){
        //B-Heptomino
        drawPattern("2bo$2obo$2b2o$bo!");
        currentInput="";
        return;
    }else if(currentInput === "20"){
        //tarantula
        drawPattern("4bo15bo$3b3o13b3o$9b3ob3o$bo6bobo3bobo6bo$obobo3bo7bo3bobobo$3bob2o2b3ob3o2b2obo$o23bo$2o4b2o9b2o4b2o$2o4b2o9b2o4b2o!");
        currentInput="";
        return;
    }

    else if(currentInput === "21"){
        //Simkin Glider Gun
        drawPattern("15bo$13b2o$14b2o3$20b3o$20bo$21bo3$7b2o$7b2o2$3o$2bo$bo6$30b3o$30bo$31bo!");
        currentInput="";
        return;
    }else if(currentInput === "22"){
        //Copperhead
        drawPattern("4bo$2b5o$bo5bo$bo2b3o2bo$ob2o3b2obo$bo2b3o2bo$bo5bo$2b5o$4bo3$16b2o$16b2o!");
        currentInput="";
        return;
    }else if(currentInput === "23"){
        //griddle
        drawPattern("6o$o4bo$2bobo$2bo!");
        currentInput="";
        return;
    }else if(currentInput === "24"){
        //replicator
        drawPattern("2b3o$bo2bo$o3bo$o2bob$3o!");
        currentInput="";
        return;
    }else if(currentInput === "25"){
        //drylifeflowergarden
        drawPattern("8bo3bo$7bobobobo$8b2ob2o$b2o15b2o$o2bo13bo2bo$b3o13b3o2$b3o13b3o$o2bo13bo2bo$b2o15b2o$8b2ob2o$7bobobobo$8bo3bo!");
        currentInput="";
        return;
    }else if(currentInput === "26"){
        //dayandnightfireball
        drawPattern("6bo$6b2o2$8bo$5bo2bo$5b3o9$3bo$3bo$b3obob2o$ob3ob2obo$ob7o$b9o$3b7o$11o$obob5obo$2b6obo$bob4obo$3b6o$3b5o$3b2o$2b2o$3b2ob2o$3b2obo$4b3o$obob2obo$o2b5o$2b4obo$ob4o$b6o$2b4o$2b4obo$3b4ob2o$3b7o$4b5o$3b7o$11o$11o$b9o$8o$b8o$2b6o$3b4o$4b2o!");
        currentInput="";
        return;
    }else if(currentInput === "27"){
        //Pedestrian Life
        drawPattern("2o$2o2$8b2o$7bo2bo$5b2ob2o$5b2ob2o$7bo5$18b3o$18bobo$18b3o7$24b2o$23b3o$23bo2bo$24b2o$37b2o$37bobo$38bo!");
        currentInput="";
        return;
    }else if(currentInput === "28"){
        //Replicator-based period 96 oscillator in HighLife
        drawPattern("2o33b$2o10bo22b$11b2o22b$10bobo22b$9b3o23b$35b$15b3o17b$14bobo18b$14b2o19b$14bo20b$35b$35b$35b$35b$35b$35b$35b$33b2o$33b2o!");
        currentInput="";
        return;
    }else if(currentInput === "29"){
        //p72centuryshuttle
        drawPattern("51bobo$29b2o19bo$25b2obo2bob2o10b2o2bo4bo$25b2o2bo4bo10b2obo2bob2o$30bo18b2o$31bobo2$34b2o$34b2o10b2o$34bo11b2o$18bo14bobo$18b3o12bob2o4b2o$21bo10bo6bo2b2o$20b2o11b3o4b2o$38bo$26b3o8bo$26bobo$26bo2bo$28b2o5$12bo$13bo$8b3o4b2o16b2o$7bo6bo2b2o14bo$8bob2o4b2o16b3o$8bobo25bo$9bo11b2o$9b2o10b2o$9b2o2$6bobo$5bo18b2o$2o2bo4bo10b2obo2bob2o$2obo2bob2o10b2o2bo4bo$4b2o19bo$26bobo!");
        currentInput="";
        return;
    }else if(currentInput === "30"){
        //winghfhassler
        drawPattern("4b2o15bo$2obo2bob2o10bobo$2o2bo4bo10bobo$5bo13b2ob3o$6bobo16bo$19b2ob3o$19b2obo3$11b3o$2o8bo3bo$2o13bo4bo5bo$9bo4bo4b3o3b3o$9b2ob2o4bobobobobobo$11bo5b2obobobobob2o$17bob4ob4obo$17b5o3b5o3$21b2ob2o$20bobobobo$21bo3bo!");
        currentInput="";
        return;
    }
});

function isNumber(char) {
    return !isNaN(parseInt(char)) && isFinite(char);
}

function drawPattern(str){
    resetGrid();
    let r = 20;
    let c = 20;
    let x=r;
    let y=c;
    let num=1;
    for (let i = 0; i < str.length; i++){
        if(str[i] === 'b'){
            for(let i=0; i<num; i++){
                x+=1;
            }
            num=1;
        } else if(str[i] === 'o'){
            for(let i=0; i<num; i++){
                grid[x][y] = 1;
                console.log(x, y);
                x+=1;
            }
            num = 1;
        } else if(str[i] === '$'){
            y += 1;
            x=r;
        } else if(isNumber(str[i])){
            let stringNum = "";
            stringNum+=str[i];
            while(isNumber(str[i+1])){
                stringNum+=str[i+1];
                i+=1;
            }
            num = Number(stringNum);
        } else {
            console.log("end");
            break;
        }
        draw();
    }
}

// Set initial theme button text
themeToggleBtn.textContent = 'Light Theme';

// Initialize on load
window.onload = initCanvas;