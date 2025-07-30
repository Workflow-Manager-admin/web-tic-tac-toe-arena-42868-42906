import React, { useState, useEffect } from "react";
import "./App.css";

/*
PUBLIC_INTERFACE
App is the main React component for the Tic Tac Toe game.
Features:
  - Two-player and Play-vs-Computer modes.
  - Modern, minimal, responsive UI.
  - Score tracking and reset functionality.
  - Uses color theme: primary (#1976D2), secondary (#424242), accent (#FFD600).
  - Board and layout are centered and clean.
*/
const COLORS = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FFD600",
  lightBg: "#fff",
  darkText: "#222",
};

const MODES = {
  PVP: "2 Players",
  PVC: "Play vs Computer",
};

const initialState = () => ({
  board: Array(9).fill(null),
  xIsNext: true,
  winner: null,
  tie: false,
});

function getWinner(board) {
  // PUBLIC_INTERFACE: Determine the winner of the board
  const lines = [
    [0, 1, 2],[3, 4, 5],[6, 7, 8],
    [0, 3, 6],[1, 4, 7],[2, 5, 8],
    [0, 4, 8],[2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // 'X' or 'O'
    }
  }
  return null;
}

function getAvailableMoves(board) {
  return board
    .map((cell, idx) => (cell ? null : idx))
    .filter((v) => v !== null);
}

function getRandomMove(board) {
  // PUBLIC_INTERFACE: Get random available move (easy AI)
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function bestAIMove(board) {
  // Simple (non-minimax): Try to win, block, else random
  const moves = getAvailableMoves(board);
  // Try to win
  for (let idx of moves) {
    const copy = board.slice();
    copy[idx] = "O";
    if (getWinner(copy) === "O") return idx;
  }
  // Try to block
  for (let idx of moves) {
    const copy = board.slice();
    copy[idx] = "X";
    if (getWinner(copy) === "X") return idx;
  }
  // Else random
  return getRandomMove(board);
}

function nextTurn(board) {
  return board.filter((x) => x).length % 2 === 0 ? "X" : "O";
}

// PUBLIC_INTERFACE
function App() {
  // Theme toggler (light mode as specified)
  const [theme, setTheme] = useState("light");

  // Game mode: Player vs Player or Player vs Computer
  const [mode, setMode] = useState(MODES.PVP);
  // Game state
  const [game, setGame] = useState(initialState());
  // Score state
  const [scores, setScores] = useState({ X: 0, O: 0, Tie: 0 });
  // Show start screen or game
  const [started, setStarted] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // If it's computer's turn and game not over, make computer move
    if (
      started &&
      mode === MODES.PVC &&
      !game.winner &&
      !game.tie &&
      !game.xIsNext // O is Computer
    ) {
      const timer = setTimeout(() => {
        const idx = bestAIMove(game.board);
        if (idx !== null) handleMove(idx);
      }, 375);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [game, mode, started]);

  const startNewGame = () => {
    setGame(initialState());
    setStarted(true);
  };

  const resetAll = () => {
    setGame(initialState());
    setScores({ X: 0, O: 0, Tie: 0 });
    setStarted(false);
    setMode(MODES.PVP);
  };

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    if (game.board[idx] || game.winner || game.tie) return;
    const board = [...game.board];
    board[idx] = game.xIsNext ? "X" : "O";
    const winner = getWinner(board);
    const tie = !winner && board.every((cell) => cell);
    setGame({
      board,
      xIsNext: !game.xIsNext,
      winner,
      tie,
    });
    if (winner || tie) {
      setTimeout(() => {
        setScores((prev) => ({
          ...prev,
          [winner ? winner : "Tie"]: prev[winner ? winner : "Tie"] + 1,
        }));
      }, 120);
    }
  }

  function chooseMode(newMode) {
    setMode(newMode);
    setStarted(false);
    setGame(initialState());
  }

  // UI renderers
  function renderCell(idx) {
    return (
      <button
        className="ttt-cell"
        style={{
          color: game.board[idx] === "X" ? COLORS.primary : COLORS.accent,
          borderColor: COLORS.secondary,
        }}
        key={idx}
        aria-label={"Cell " + (idx + 1)}
        onClick={() => handleMove(idx)}
        disabled={Boolean(game.board[idx] || game.winner || game.tie || (mode === MODES.PVC && !game.xIsNext))}
      >
        {game.board[idx]}
      </button>
    );
  }

  function renderStatus() {
    if (game.winner) {
      return (
        <div className="status" data-testid="status">
          <span className="winnerText" style={{ color: COLORS.accent }}>
            {game.winner === "X" && mode === MODES.PVC
              ? "You Win! 🎉"
              : game.winner === "O" && mode === MODES.PVC
              ? "Computer Wins!"
              : `Winner: ${game.winner}`}
          </span>
        </div>
      );
    } else if (game.tie) {
      return (
        <div className="status" data-testid="status">
          <span className="tieText" style={{ color: COLORS.secondary }}>
            Tie Game!
          </span>
        </div>
      );
    } else {
      return (
        <div className="status" data-testid="status">
          <span>
            {mode === MODES.PVP
              ? `Turn: ${game.xIsNext ? "X" : "O"}`
              : game.xIsNext
              ? "Your Turn"
              : "Computer's Turn"}
          </span>
        </div>
      );
    }
  }

  return (
    <div className="main-app-bg">
      <div className="ttt-root-container">
        <div className="theme-toggle">
          <button
            className="theme-toggle-btn"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            style={{
              background: theme === "light" ? COLORS.secondary : COLORS.primary,
              color: COLORS.accent,
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="ttt-header" style={{ color: COLORS.primary }}>
          <h1>Tic Tac Toe</h1>
          <div className="mode-select">
            <ModeSelect
              mode={mode}
              onSelect={chooseMode}
              disable={started}
              colors={COLORS}
            />
          </div>
        </div>
        <div className="score-section">
          <ScoreBoard scores={scores} colors={COLORS} mode={mode} />
        </div>
        <div className="board-container">
          {!started ? (
            <button
              className="start-btn"
              style={{
                background: COLORS.primary,
                color: COLORS.lightBg,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
              onClick={startNewGame}
              data-testid="start-btn"
            >
              Start Game
            </button>
          ) : (
            <>
              <div className="status-section">{renderStatus()}</div>
              <div className="ttt-board" tabIndex="0" aria-label="Game board">
                {Array(9)
                  .fill(null)
                  .map((_, idx) => renderCell(idx))}
              </div>
              <div className="controls-row">
                <button
                  className="reset-btn"
                  style={{
                    background: COLORS.secondary,
                    color: COLORS.accent,
                    border: "none",
                  }}
                  onClick={startNewGame}
                  data-testid="reset-btn"
                >
                  ↻ New Game
                </button>
                <button
                  className="fullreset-btn"
                  style={{
                    background: "transparent",
                    border: `1.5px solid ${COLORS.secondary}`,
                    color: COLORS.secondary,
                  }}
                  onClick={resetAll}
                  data-testid="fullreset-btn"
                >
                  Reset All
                </button>
              </div>
            </>
          )}
        </div>
        <footer className="footer-text">
          <span>
            <a
              href="https://reactjs.org/"
              style={{ color: COLORS.primary, textDecoration: "none" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with React
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function ModeSelect({ mode, onSelect, disable, colors }) {
  // PUBLIC_INTERFACE: Change game mode (Two-player/Play vs Computer)
  return (
    <div className="mode-btn-group">
      <button
        className={`mode-btn${mode === MODES.PVP ? " active" : ""}`}
        onClick={() => onSelect(MODES.PVP)}
        disabled={disable}
        style={{
          background: mode === MODES.PVP ? colors.primary : "#f6f8fa",
          color: mode === MODES.PVP ? colors.accent : colors.secondary,
          border: `1px solid #e1e1e1`,
        }}
        aria-pressed={mode === MODES.PVP}
        tabIndex="0"
      >
        2 Players
      </button>
      <button
        className={`mode-btn${mode === MODES.PVC ? " active" : ""}`}
        onClick={() => onSelect(MODES.PVC)}
        disabled={disable}
        style={{
          background: mode === MODES.PVC ? colors.primary : "#f6f8fa",
          color: mode === MODES.PVC ? colors.accent : colors.secondary,
          border: `1px solid #e1e1e1`,
        }}
        aria-pressed={mode === MODES.PVC}
        tabIndex="0"
      >
        Play vs Computer
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function ScoreBoard({ scores, colors, mode }) {
  // PUBLIC_INTERFACE: Display scores for X, O, Tie
  return (
    <div className="scoreboard-root">
      <span className="score-x" style={{ color: colors.primary }}>
        {mode === MODES.PVC ? "You" : "X"} : {scores.X}
      </span>
      <span className="score-tie" style={{ color: "#999" }}>
        Tie : {scores.Tie}
      </span>
      <span className="score-o" style={{ color: colors.accent }}>
        {mode === MODES.PVC ? "Computer" : "O"} : {scores.O}
      </span>
    </div>
  );
}

export default App;
