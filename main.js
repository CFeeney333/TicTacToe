// Enums
const GameSymbol = {
  x: "X",
  o: "O",
  none: "N",
};

const View = {
  start: Symbol("start"),
  game: Symbol("game"),
  end: Symbol("end"),
};

const Type = {
  computer: Symbol("computer"),
  human: Symbol("human"),
};

const Model = function () {
  const _subscribers = new Array();

  const subscribe = (callback) => {
    _subscribers.push(callback);
  };

  const unsubscribe = (callback) => {
    _subscribers = _subscribers.filter((subscriber) => subscriber !== callback);
  };

  const notify = () => {
    _subscribers.forEach((callback) => callback());
  };

  return { subscribe, unsubscribe, notify };
};

const boardModel = (function () {
  const _createBoard = () => {
    const grid = new Array();
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
    const clone = new Array();
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

  return { getName, setName, getType, setType, getSymbol };
};

// const callback = function () {
//   console.log("me the callback were called and all");
//   console.log("this be the board state");
//   let output = "";
//   let board = boardModel.getBoard();
//   for (let row of board) {
//     for (let elem of row) {
//       output += elem;
//     }
//     output += "\n";
//   }
//   console.log(output);

//   const winner = boardModel.getWinner();
//   if (winner === GameSymbol.x) {
//     console.log("Player 1 wins");
//     boardModel.resetBoard();
//   } else if (winner === GameSymbol.o) {
//     console.log("Player 2 wins");
//     boardModel.resetBoard();
//   } else {
//     if (boardModel.isFull()) {
//       console.log("Game Over. No winner.");
//       gameBoard.resetBoard();
//     }
//   }
// };

// boardModel.subscribe(callback);
// boardModel.resetBoard();

// boardModel.setSymbol(GameSymbol.x, 0, 0);
// boardModel.setSymbol(GameSymbol.x, 1, 0);
// boardModel.setSymbol(GameSymbol.x, 2, 0);

// console.log("is full?: " + boardModel.isFull());
// console.log("winner: " + boardModel.getWinner());
