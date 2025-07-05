// 🔥 Your Firebase config (replace this with your own from Firebase Console)

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT.firebaseapp.com",

  databaseURL: "https://YOUR_PROJECT.firebaseio.com",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_PROJECT.appspot.com",

  messagingSenderId: "SENDER_ID",

  appId: "APP_ID"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

let roomID = "";

let playerName = "";

let playerRole = ""; // X or O

function joinRoom() {

  playerName = document.getElementById("playerName").value.trim();

  roomID = document.getElementById("roomInput").value.trim();

  if (!roomID || !playerName) return alert("Enter your name and a room ID!");

  document.getElementById("game").style.display = "block";

  const roomRef = db.ref("rooms/" + roomID);

  roomRef.once("value", snap => {

    if (!snap.exists()) {

      // First player (X)

      roomRef.set({

        board: Array(9).fill(""),

        currentPlayer: "X",

        winner: "",

        players: {

          X: playerName

        }

      });

      playerRole = "X";

    } else {

      // Second player (O)

      roomRef.child("players/O").set(playerName);

      playerRole = "O";

    }

    listenToBoard();

  });

}

function makeMove(index) {

  const roomRef = db.ref("rooms/" + roomID);

  roomRef.once("value", snapshot => {

    const data = snapshot.val();

    const board = data.board;

    const turn = data.currentPlayer;

    const winner = data.winner;

    if (winner || board[index] !== "" || turn !== playerRole) return;

    board[index] = playerRole;

    const nextPlayer = playerRole === "X" ? "O" : "X";

    const win = checkWin(board);

    roomRef.update({

      board: board,

      currentPlayer: nextPlayer,

      winner: win ? playerRole : ""

    });

  });

}

function listenToBoard() {

  const roomRef = db.ref("rooms/" + roomID);

  roomRef.on("value", snapshot => {

    const data = snapshot.val();

    if (!data) return;

    const board = data.board;

    const turn = data.currentPlayer;

    const winner = data.winner;

    // Update board

    document.querySelectorAll(".cell").forEach((cell, i) => {

      cell.textContent = board[i];

      cell.style.color = board[i] === "X" ? "red" : board[i] === "O" ? "blue" : "black";

    });

    // Update status using player names

    roomRef.child("players").once("value", snap => {

      const players = snap.val() || {};

      const turnName = players[turn] || `Player ${turn}`;

      const winnerName = players[winner] || `Player ${winner}`;

      if (winner) {

        document.getElementById("turnInfo").textContent = `🎉 ${winnerName} wins!`;

        document.getElementById("result").textContent = `🎉 ${winnerName} wins!`;

      } else {

        document.getElementById("turnInfo").textContent = `🟢 ${turnName}'s turn (${turn})`;

        document.getElementById("result").textContent = "";

      }

    });

  });

  document.querySelectorAll(".cell").forEach(cell => {

    cell.onclick = () => {

      const index = parseInt(cell.dataset.index);

      makeMove(index);

    };

  });

}

function resetBoard() {

  db.ref("rooms/" + roomID).update({

    board: Array(9).fill(""),

    currentPlayer: "X",

    winner: ""

  });

}

function checkWin(b) {

  const wins = [

    [0,1,2], [3,4,5], [6,7,8],

    [0,3,6], [1,4,7], [2,5,8],

    [0,4,8], [2,4,6]

  ];

  return wins.some(p => b[p[0]] && b[p[0]] === b[p[1]] && b[p[0]] === b[p[2]]);

}