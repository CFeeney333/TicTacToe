// Enums
const GameSymbol = {
    x: "X",
    o: "O",
    none: "",
};

const Type = {
    computer: "Computer",
    human: "Human",
};

const Model = function () {
    let _subscribers = [];

    const subscribe = (callback) => {
        _subscribers.push(callback);
    };

    const unsubscribe = (callback) => {
        _subscribers = _subscribers.filter((subscriber) => subscriber !== callback);
    };

    const notify = () => {
        _subscribers.forEach((callback) => callback());
    };

    return {subscribe, unsubscribe, notify};
};

const boardModel = (function () {
    const _createBoard = () => {
        const grid = [];
        for (let i = 0; i < 3; i++) {
            const row = [GameSymbol.none, GameSymbol.none, GameSymbol.none];
            grid.push(row);
        }
        return grid;
    };

    const _board = _createBoard();
    const _prototype = Model();

    const isFull = () => {
        for (let row of _board) {
            if (row.includes(GameSymbol.none)) {
                return false;
            }
        }
        return true;
    };

    const isEmpty = () => {
        for (let row of _board) {
            for (let elem of row) {
                if (elem === GameSymbol.x || elem === GameSymbol.o) {
                    return false;
                }
            }
        }
        return true;
    };

    const getWinner = () => {
        // check along the diagonals with brute force
        if (_board[0][0] === _board[1][1] && _board[0][0] === _board[2][2]) {
            if (_board[0][0] !== GameSymbol.none) return _board[0][0];
        }
        if (_board[2][0] === _board[1][1] && _board[2][0] === _board[0][2]) {
            if (_board[2][0] !== GameSymbol.none) return _board[0][0];
        }
        // check to see if three along any row
        for (let row of _board) {
            if (row[0] === row[1] && row[0] === row[2]) {
                if (row[0] !== GameSymbol.none) return row[0];
            }
        }

        // check along the columns
        for (let i = 0; i < 3; i++) {
            if (_board[0][i] === _board[1][i] && _board[0][i] === _board[2][i]) {
                if (_board[0][i] !== GameSymbol.none) return _board[0][i];
            }
        }
        return GameSymbol.none;
    };

    const setSymbol = (symbol, row, column) => {
        if (_board[row][column] === GameSymbol.none) {
            _board[row][column] = symbol;
            _prototype.notify();
        }
    };

    const resetBoard = () => {
        for (let row of _board) {
            for (let i = 0; i < 3; i++) {
                row[i] = GameSymbol.none;
            }
        }
        _prototype.notify();
    };

    const getBoard = () => {
        const clone = [];
        _board.forEach((row) => clone.push([...row]));
        return clone;
    };

    return Object.assign(
        {},
        {
            ..._prototype,
            setSymbol,
            resetBoard,
            getBoard,
            getWinner,
            isFull,
            isEmpty,
        }
    );
})();

const playerFactory = function (symbol, name, type) {
    const _symbol = symbol;
    let _name = name;
    let _type = type;

    const getName = () => {
        return _name.slice(0);
    };

    const setName = (name) => {
        _name = name;
    };

    const getType = () => {
        return _type;
    };

    const setType = (type) => {
        _type = type;
    };

    const getSymbol = () => {
        return _symbol;
    };

    return {getName, setName, getType, setType, getSymbol};
};

// controller code
boardModel.subscribe(boardChange);
const timeouts = []; // so I can clear timeouts when the board changes
// otherwise, if the computer is taking a go and the timeout is running,
// and the reset button is pressed, the computer will place a symbol on
// the new reset board, which is undesirable

const Players = {
    playerX: playerFactory(GameSymbol.x, null, null),
    playerO: playerFactory(GameSymbol.o, null, null),
};
let activePlayer = null;
const playerXTitle = document.querySelector("#player-x-title");
const playerOTitle = document.querySelector("#player-o-title");

const View = {
    new: document.querySelector("#new-view"),
    game: document.querySelector("#game-view"),
    end: document.querySelector("#end-view"),
};
let activeView = View.new;

const startButton = document.querySelector("#start-button");
startButton.addEventListener("click", onStartButtonClick);

const cells = [];
document.querySelectorAll(".cell").forEach((cell) => cells.push(cell));
cells.forEach((cell) => cell.addEventListener("click", onCellClick));

const quitButton = document.querySelector("#quit-button");
quitButton.addEventListener("click", onQuitClick);

const resetButton = document.querySelector("#reset-button");
resetButton.addEventListener("click", onResetClick);

const newButton = document.querySelector("#new-button");
newButton.addEventListener("click", onNewClick);

function setActivePlayer(player) {
    activePlayer = player;
    switch (player) {
        case Players.playerX:
            hide(playerOTitle);
            unHide(playerXTitle);
            break;
        case Players.playerO:
            hide(playerXTitle);
            unHide(playerOTitle);
            break;
    }
}

function toggleActivePlayer() {
    switch (activePlayer) {
        case Players.playerX:
            setActivePlayer(Players.playerO);
            break;
        case Players.playerO:
            setActivePlayer(Players.playerX);
            break;
    }
}

function setActiveView(view) {
    hide(activeView);
    activeView = view;
    unHide(activeView);
}

function hide(element) {
    if (!element.classList.contains("hidden")) {
        element.classList.add("hidden");
    }
}

function unHide(element) {
    if (element.classList.contains("hidden")) {
        element.classList.remove("hidden");
    }
}

function onStartButtonClick() {
    Players.playerX.setName(document.querySelector("#player-x-name").value);
    switch (document.querySelector("#player-x-type").value) {
        case "Computer":
            Players.playerX.setType(Type.computer);
            break;
        default:
            Players.playerX.setType(Type.human);
            break;
    }
    document
        .querySelector("#player-x-title")
        .querySelector(".player-name").textContent = Players.playerX.getName();

    Players.playerO.setName(document.querySelector("#player-o-name").value);
    switch (document.querySelector("#player-o-type").value) {
        case "Computer":
            Players.playerO.setType(Type.computer);
            break;
        default:
            Players.playerO.setType(Type.human);
            break;
    }
    document
        .querySelector("#player-o-title")
        .querySelector(".player-name").textContent = Players.playerO.getName();

    setActiveView(View.game);
    setActivePlayer(Players.playerX);
    boardModel.resetBoard();
}

function onCellClick(event) {
    if (activePlayer.getType() === Type.human) {
        boardModel.setSymbol(
            activePlayer.getSymbol(),
            event.target.dataset.row,
            event.target.dataset.column
        );
    }
}

function computerMove() {
  // for now, add the symbol to the first free space (it will never reach here
  // if the board is full, so there will be a free space)
  const board = boardModel.getBoard();
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === GameSymbol.none) {
        boardModel.setSymbol(activePlayer.getSymbol(), r, c);
        return;
      }
    }
  }
}

function onQuitClick() {
    // as of now this does the same thing as new the new button
    onNewClick();
}

function onResetClick() {
    for (let i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    setActivePlayer(Players.playerX);
    boardModel.resetBoard();
}

function onNewClick() {
    setActiveView(View.new);
    document.querySelector("#player-x-name").value = Players.playerX.getName();
    document.querySelector("#player-x-type").value = Players.playerX.getType();
    document.querySelector("#player-o-name").value = Players.playerO.getName();
    document.querySelector("#player-o-type").value = Players.playerO.getType();
}

function onEnd(winner) {
    setActiveView(View.end);
    const winnerName = document
        .querySelector("#win-message")
        .querySelector(".player-name");
    if (winner === GameSymbol.none) {
        winnerName.textContent = "Nobody";
    } else {
        winnerName.textContent = activePlayer.getName();
    }
}

function boardChange() {
    const winner = boardModel.getWinner();
    if (winner === GameSymbol.x) {
        setTimeout(onEnd, 1000, winner);
    } else if (winner === GameSymbol.o) {
        setTimeout(onEnd, 1000, winner);
    } else {
        if (boardModel.isFull()) {
            setTimeout(onEnd, 1000, winner);
        }
        if (boardModel.isEmpty()) {
            setActivePlayer(Players.playerX);
        } else {
            toggleActivePlayer();
        }
    }
    if (activePlayer.getType() === Type.computer) {
        timeouts.push(setTimeout(computerMove, 1000));
    }
    viewUpdateBoard();
}

function viewUpdateBoard() {
    const board = boardModel.getBoard();
    for (let cell of cells) {
        cell.textContent = board[cell.dataset.row][cell.dataset.column];
    }
}
