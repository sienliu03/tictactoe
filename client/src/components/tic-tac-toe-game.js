import React, { Component } from "react";
import { Table } from "reactstrap";

class ticTacToeGame extends Component {
  state = {
    board: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
    turnNumber: 1,
    gameEnded: false,
    playAI: true,
    waitingTurn: false
  };

  componentDidMount () {
    
  }

  componentDidUpdate(prevState) {
    const { board, turnNumber, gameEnded, playAI, waitingTurn } = this.state;
    
    if (turnNumber !== prevState.turnNumber && waitingTurn !== prevState.waitingTurn && !waitingTurn) {
      if(playAI && !gameEnded && turnNumber % 2 == 0) {
        console.log("AI turn:", turnNumber);
        this.promptAPIForMove(board);
      }
    }

    if (waitingTurn !== prevState.waitingTurn && waitingTurn) {
      console.log("Waiting for opponent move...");
    }

    if (turnNumber !== prevState.turnNumber && waitingTurn !== prevState.waitingTurn && !waitingTurn) {
      if(turnNumber % 2 == 1){
        console.log("It's your turn!");
      }
    }
  }

  placeMove = (e, row, col) => {
    const { turnNumber, gameEnded } = this.state;
   
    if(!gameEnded) {
      let space;
      let r;
      let c;
      if (e) { // click place
        space = e.target;
        r = space.getAttribute('data-r');
        c = space.getAttribute('data-c');
      } else { // corrdinate place
        r = row;
        c = col;
        space = document.querySelectorAll(`[data-r="${r}"][data-c="${c}"]`)[0];
      }
      
      // console.log(space);
      // console.log("turn:", turnNumber);
      // console.log(space.innerText);

      if (space.innerText === "") { // move is open
        if (turnNumber % 2 == 1) {
          space.innerText = "X";
        } else {
          space.innerText = "O";
        }

        this.updateBoard(r, c);
        let isEndGame = this.checkGameEndingMove(r, c);
        if(isEndGame || isEndGame == null) { //null - draw
          this.setState({gameEnded: isEndGame});
        }
        this.updatedTurn();
      }
    }
  }

  updateBoard = (r, c) => {
    let { board } = this.state; 
    if (this.state.turnNumber % 2 == 1) {
      board[r][c] = "X";
    } else {
      board[r][c] = "O";
    }
    this.setState({board: board});
  }
  
  checkGameEndingMove = (r, c) =>{
    let { turnNumber, board } = this.state;
    let piece = turnNumber % 2 == 1? 'X' : 'O';
    let isWin = true;
    
    if (turnNumber >= 5 ) {
      
      // check row
      for(let i = 0; i < 3; i++ ) {
        if(piece !== board[r][i]){
          break;
        }
        if(i == 2) {
          console.log("row win");
          return isWin;
        }
      }
      
      // check col
      for(let i = 0; i < 3; i++ ) {
        if(piece !== board[i][c]){
          break;
        }
        if(i == 2) {
          console.log("col win");
          return isWin;
        }
      }
      
      // check diag
      if(r == c){
        for(let i = 0; i < 3; i++){
          if(piece != board[i][i]) {
            break;
          }
          if(i == 2){
            console.log("diag win");
            return isWin;
          }
        }
      }
      
      // check anti diag
      if(r + c == 2){
        for(let i = 0; i < 3; i++){
          if(piece != board[i][2-i] ) {
            break;
          }
          if(i == 2){
            console.log("anti diag win");
            return isWin;
          }
        }
      }
      
      // check draw
      if(turnNumber == 9){
        console.log("draw");
        return null;
      }
    }
    return false; 
  }

  updatedTurn = () => {
    this.setState(prevState => {
      return {turnNumber: prevState.turnNumber + 1}
    });
  }

  promptAPIForMove = async(board) => {
    console.log("promptAPI")
    const token = sessionStorage.getItem("ticTacToeUserToken");
    const response = await fetch("/engine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify({ 
        board: board,
        token: token
      }),
    });

    let body = await response.text();
    body = JSON.parse(body);
    this.setState({waitingTurn: true});

    if (body.success) {
      // console.log(body.board);
      let move = this.findBoardDifference(board, body.board);
      // console.log(move); 
      this.placeMove(null, move.r, move.c);
      this.setState({waitingTurn: false});
    }
  }

  findBoardDifference = (oldBoard, newBoard) => {
    for(let i = 0; i < oldBoard.length; i++){
      let oldRow = oldBoard[i];
      let newRow = newBoard[i];
      // console.log(oldRow, newRow);
      for(let j = 0; j < oldBoard.length; j++){
        if(oldRow[j] !== newRow[j]){
          return {'r': i, 'c': j}
        }
      } 
    }
  }

  initBoard = () => {
    return (
      <Table dark>
        <tbody>
          <tr>
            <td>
              <button data-r="0" data-c="0" onClick={(e) => this.placeMove(e)}></button>
            </td>
            <td>
              <button data-r="0" data-c="1" onClick={(e) => this.placeMove(e)}></button>
            </td>
            <td>
              <button data-r="0" data-c="2" onClick={(e) => this.placeMove(e)}></button>
            </td>
          </tr>
          <tr>
            <td>
              <button data-r="1" data-c="0" onClick={(e) => this.placeMove(e)}></button>
            </td>
            <td>
              <button data-r="1" data-c="1" onClick={(e) => this.placeMove(e)}></button>
            </td>
            <td>
              <button data-r="1" data-c="2" onClick={(e) => this.placeMove(e)}></button>
            </td>
          </tr>
          <tr>
            <td>
              <button data-r="2" data-c="0" onClick={(e) => this.placeMove(e)}></button>
            </td>
            <td>
              <button data-r="2" data-c="1" onClick={(e) => this.placeMove(e)}></button>
            </td>
            <td>
              <button data-r="2" data-c="2" onClick={(e) => this.placeMove(e)}></button>
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }
 
  render() {
    return (
      <div className="board">
        {this.initBoard()}
      </div>
    );
  }
}

export default ticTacToeGame;