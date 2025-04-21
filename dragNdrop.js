const shapes = document.querySelectorAll('.shape');
const dropzones = document.querySelectorAll('.dropzone');
const shapesOriginContainer = document.getElementById('shapes-origin');
const messageArea = document.getElementById('message-area');
const resetButton = document.getElementById('reset-button');
const scoreValueElement = document.getElementById('score-value');
const timerValueElement = document.getElementById('timer-value');
const gameContainer = document.querySelector('.game-container');

let draggedElement = null;
let placedCount = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 60;
let isGameOver = false;

function updateScoreDisplay() {
    scoreValueElement.textContent = score;
}

function updateTimerDisplay() {
    timerValueElement.textContent = timeLeft;
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    updateTimerDisplay();

    timerInterval = setInterval(function() { // Reemplazada función flecha
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function endGame(isWin) {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(timerInterval);

    shapes.forEach(function(shape) { // Reemplazada función flecha (si la hubiera)
        shape.draggable = false;
        shape.classList.remove('dragging');
        shape.style.cursor = 'default';
    });

    gameContainer.classList.add('game-over-state');

    if (isWin) {
        messageArea.textContent = `¡Felicidades! Puntuación final: ${score}`;
        messageArea.classList.add('final-score');
    } else {
        messageArea.textContent = '¡HAS PERDIDO!';
        messageArea.classList.add('game-over');
    }
}

function checkGameCompletion() {
    if (isGameOver) return;
    if (placedCount === shapes.length) {
        endGame(true);
    }
}

function resetGame() {
    isGameOver = false;
    gameContainer.classList.remove('game-over-state');
    placedCount = 0;
    score = 0;
    updateScoreDisplay();
    messageArea.textContent = '';
    messageArea.classList.remove('final-score', 'game-over');

    dropzones.forEach(function(zone) { 
        zone.innerHTML = '';
        zone.classList.remove(
            'correct', 'occupied', 'drag-over',
            'dropzone-error-flash', 'dropzone-correct-pulse'
        );
        zone.style.boxShadow = '';
    });

    shapes.forEach(function(shape) { 
        shapesOriginContainer.appendChild(shape);
        shape.draggable = true;
        shape.style.opacity = '1';
        shape.style.cursor = 'grab';
    });

    startTimer();
}

shapes.forEach(function(shape) { 
    shape.addEventListener('dragstart', function(e) {
        if (isGameOver) {
            e.preventDefault();
            return;
        }
        draggedElement = e.target;
        
        setTimeout(function() {
             
             if (draggedElement) {
                draggedElement.classList.add('dragging');
             }
        }, 0);
        e.dataTransfer.setData('text/plain', draggedElement.id);
        e.dataTransfer.effectAllowed = 'move';
    });

    shape.addEventListener('dragend', function(e) { 
         if(e.target) {
            e.target.classList.remove('dragging');
         }
    });
});

dropzones.forEach(function(zone) { 
    zone.addEventListener('dragover', function(e) { 
        if (isGameOver) return;
        e.preventDefault();
        if (!this.classList.contains('occupied')) {
             this.classList.add('drag-over');
        }
    });

    zone.addEventListener('dragleave', function(e) { 
        if (isGameOver) return;
        this.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function(e) { 
        const currentDropZone = this;

        if (isGameOver || !draggedElement) {
             if(draggedElement) draggedElement.classList.remove('dragging');
             return;
        }
        e.preventDefault();
        currentDropZone.classList.remove('drag-over');

        const isCorrectShape = draggedElement.id === currentDropZone.dataset.shape;
        const isOccupied = currentDropZone.children.length > 0;

        if (isCorrectShape && !isOccupied) {
            const dropZoneElement = currentDropZone; 
            dropZoneElement.appendChild(draggedElement);
            dropZoneElement.classList.add('correct', 'occupied');
            draggedElement.draggable = false;
            draggedElement.style.cursor = 'default';
            draggedElement.classList.remove('dragging');

            dropZoneElement.classList.add('dropzone-correct-pulse');
            // Usando function() para el handler de animationend
            dropZoneElement.addEventListener('animationend', function handler() {
                 dropZoneElement.classList.remove('dropzone-correct-pulse');
                 dropZoneElement.removeEventListener('animationend', handler);
             }, { once: true });

            score += 100;
            updateScoreDisplay();
            draggedElement = null;
            placedCount++;
            checkGameCompletion();

        } else {
            const dropZoneElement = currentDropZone; 
            if (!isCorrectShape) {
                score -= 50;
                score = Math.max(0, score);
                updateScoreDisplay();

                if (score <= 0) {
                    endGame(false);
                    if (draggedElement) draggedElement.classList.remove('dragging');
                    return;
                }
            }

            dropZoneElement.classList.add('dropzone-error-flash');
           
            setTimeout(function() {
                 dropZoneElement.classList.remove('dropzone-error-flash');
            }, 500);

            dropZoneElement.classList.add('incorrect-drop-attempt');
           
            setTimeout(function() {
                 dropZoneElement.classList.remove('incorrect-drop-attempt');
            }, 300);

            if (isOccupied) console.log(`Intento de drop en zona ${currentDropZone.id} ocupada.`);
            if (draggedElement) draggedElement.classList.remove('dragging');
        }
    });
});

resetButton.addEventListener('click', resetGame); 

resetGame();