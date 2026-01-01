let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;

const cells = document.querySelectorAll('.cell');
const statusDiv = document.getElementById('status');
const resetButton = document.getElementById('reset-button');

// Function to handle a cell click
function handleCellClick(event) {
    const index = event.target.getAttribute('data-index');

    if (gameBoard[index] !== '' || !isGameActive) {
        return; // Ignore the click if the cell is already filled or the game is over
    }

    gameBoard[index] = currentPlayer;
    event.target.textContent = currentPlayer;

    if (checkWinner()) {
        statusDiv.textContent = `${currentPlayer} wins!`;
        isGameActive = false;
    } else if (gameBoard.every(cell => cell !== '')) {
        statusDiv.textContent = 'It\'s a draw!';
        isGameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDiv.textContent = `Player ${currentPlayer}'s turn`;
    }
}

// Function to check if there is a winner
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
    }); 
}

// Reset the game when the reset button is clicked
resetButton.addEventListener('click', () => {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    statusDiv.textContent = `Player ${currentPlayer}'s turn`;

    cells.forEach(cell => {
        cell.textContent = '';
    });
});

// Add click event listeners to all cells
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Function to highlight the winning combination
function highlightWinner(winningCombination) {
    winningCombination.forEach(index => {
        const cell = cells[index];
        cell.classList.add('win-line');
    });
}