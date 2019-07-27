var OFFGRID = 99;
var INACCESSIBLE = 17;
var letters = [];  
var codes = [];	
var connected = [];
var turn = 0;
var gameOver = false;
/* TODO: colors */
/* TODO: font = Chantilly Serial Regular */
/*
		Regular	Dark	Light	(Regular-2)	(Dark-2)
BLACK	323232
RED		ff4444	ce3934	ffa1a1
ORANGE	fe8400
YELLOW	ffcc40
GREEN	69e000
BLUE	33b5e5
PURPLE	8a35bb	702b98	c499dd
PINK	ff41e6
GRAY	808080	686868  N/A 
WHITE	fefffe	cfcfcf
inaccessible: f9faf9
submit button: e6e6e6
waiting: f2f2f2
// icons from flaticon.com
*/




var colors = ["#8a35bb","#ff4444"];
var darkColors = ["#702b98","#ce3934"];
var lightColors = ["#c499dd","#ffa1a1"];

/* TODO: add to css:

svg text{
   -webkit-user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   user-select: none;
}

*/




var cornerSize = 0.15; 
var H = 112;
var S = 56;
var C = 97;
var fontScale = 1.1;
var extra = 0.10;
var strokeWidth = 5;
var gap = 2*extra*C*(1-2*cornerSize)*1.75;
var buttonWidth = 3 * H;
var buttonHeight = 3 * C;
var x0 = H/2 + S + gap*C/H;
var y0 = - C + buttonHeight + gap;


// width: (H + 2*S) + 2*extra*S*(1-2*cornerSize)
// height: 2*C + 2*extra*C*(1-2*cornerSize)
function hexPath(x,y,H,S,C,cornerSize,extra){
	return "M "+x+" "+y + 
		  " h "+(H*(1-2 *cornerSize)/2) +
		  " q "+(cornerSize*H)+" 0 " + (cornerSize * (S + H) ) + " " + (cornerSize * C) +
		  " l "+(S * (1 - 2 * cornerSize)*(1+extra)) + " " + (C * (1 - 2 * cornerSize)*(1+extra)) + 
		  " q "+(cornerSize*S)+ " " + (cornerSize * C) + " " + " 0 " + (2 * cornerSize * C) +
		  " l "+(-S * (1 - 2 * cornerSize) * (1+extra)) + " " + (C * (1 - 2 * cornerSize) * (1+extra)) +
		  " q "+(-cornerSize * S) + " " + (cornerSize*C) + " " + (-(S+H) * cornerSize) + " " + (cornerSize*C) +
		  " h "+(-H*(1-2*cornerSize)) +
		  " q "+(-cornerSize * H) + " 0 " + (-cornerSize * (H + S)) + " " + (-cornerSize*C) +
		  " l "+(-(1-2*cornerSize)*S * (1+extra)) + " " + (-(1-2*cornerSize)*C * (1+extra)) +
		  " q "+(-cornerSize*S) + " " + (-cornerSize*C) + " 0 " + (-2 * cornerSize*C) +
		  " l "+((1-2*cornerSize)*S * (1+extra)) + " " + (-(1-2*cornerSize)*C * (1+extra)) +
		  " q "+(cornerSize*S) + " " + (-cornerSize*C) + " " + (cornerSize*(S+H)) + " " + (-cornerSize*C) +
		  " z";
}

function deleteLast(){
	if(codes.length > 0){
		removeLetter(codes[codes.length-1]);
	}
}

function createBoard(){
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("height","450");
	svg.setAttribute("width","600");
	
	svg.setAttribute("viewBox","0 0 2000 2000");
	svg.id = "board";
	for(let i = 0; !(i>=49); i++){
		createHex(svg,i);
	}
	let submitButton = document.createElementNS("http://www.w3.org/2000/svg","rect");
	submitButton.setAttribute("width",buttonWidth);
	submitButton.setAttribute("height",buttonHeight);
	submitButton.setAttribute("fill","#e6e6e6");
	submitButton.addEventListener("click",commit);
	let letter = document.createElementNS("http://www.w3.org/2000/svg","text");
	letter.textContent = "SUBMIT";
	letter.setAttribute("x",buttonWidth/2);
	letter.setAttribute("y",buttonHeight/2);
	letter.setAttribute("font-family",'"Chantilly Serial Regular", Helvetica, sans-serif')
	letter.setAttribute("font-size",fontScale*C*2/3);
	letter.setAttribute("text-anchor","middle");
	letter.setAttribute("dominant-baseline","central");
	letter.setAttribute("pointer-events","none");
	
	svg.appendChild(submitButton);
	svg.appendChild(letter);
	let word = document.createElementNS("http://www.w3.org/2000/svg","text");
	word.textContent = "";
	word.setAttribute("x",(7*H+8*S+8*gap*C/H)/2);
	word.setAttribute("y",buttonHeight/2);
	word.setAttribute("font-family",'"Chantilly Serial Regular", Helvetica, sans-serif')
	word.setAttribute("font-size",fontScale*C);
	word.setAttribute("text-anchor","middle");
	word.setAttribute("dominant-baseline","central");
	word.setAttribute("pointer-events","none");
	word.id = "word";
	svg.appendChild(word);
	let rightButton = document.createElementNS("http://www.w3.org/2000/svg","rect");
	rightButton.setAttribute("width",buttonWidth);
	rightButton.setAttribute("height",buttonHeight);
	rightButton.setAttribute("x",7*H+8*S+8*gap*C/H-buttonWidth);
	rightButton.setAttribute("fill","#e6e6e6");
	rightButton.addEventListener("click",deleteLast);
	svg.appendChild(rightButton);
	let letter2 = document.createElementNS("http://www.w3.org/2000/svg","text");
	letter2.textContent = "<";
	letter2.setAttribute("x",7*H+8*S+8*gap*C/H-buttonWidth/2);
	letter2.setAttribute("y",buttonHeight/2);
	letter2.setAttribute("font-family",'"Chantilly Serial Regular", Helvetica, sans-serif')
	letter2.setAttribute("font-size",fontScale*C*2/3);
	letter2.setAttribute("text-anchor","middle");
	letter2.setAttribute("dominant-baseline","central");
	letter2.setAttribute("pointer-events","none");
	svg.appendChild(letter2);
	document.body.appendChild(svg);
}

function clickHandler(code) {
	let blargh = function() {
		if(gameOver){
			return;
		}
		if(codes.includes(code)){
			removeLetter(code);
		} else {
			addLetter(code);
		}
	};
	return blargh;
}

function createHex(svg,code){
	let i = X(code);
	let j = Y(code);
	if(isOffGrid(i,j)){
		return;
	}
	let x = x0+(H+S+gap*C/H)*i;
	let y = y0+(2*C+gap)*j;
	if(i % 2 === 1){
		y += C+gap/2;
	}
	if(grid[i][j] === INACCESSIBLE){
		let path2 = document.createElementNS("http://www.w3.org/2000/svg","path");
		path2.setAttribute("d",hexPath(x,y,H,S,C,cornerSize,0));
		path2.setAttribute("fill","#f9faf9");
		let path = document.createElementNS("http://www.w3.org/2000/svg","path");
		path.setAttribute("fill","white");
		path.setAttribute("d",hexPath(x,y+C/2,H/2,S/2,C/2,cornerSize,0));
		path2.id = "O-"+code;
		path.id= "I-"+code;
		svg.appendChild(path2);
		svg.appendChild(path);
	} else if(Number.isInteger(grid[i][j])){
		let path2 = document.createElementNS("http://www.w3.org/2000/svg","path");
		path2.setAttribute("d",hexPath(x,y,H,S,C,cornerSize,0));
		path2.setAttribute("fill",colors[grid[i][j]%2]);
		path2.id = "O-"+code;
		svg.appendChild(path2);
		//capital
		if(grid[i][j] >= 2){
			let path = document.createElementNS("http://www.w3.org/2000/svg","svg");
			path.setAttribute("viewBox","0 0 45.436 45.436");
			let path3 = document.createElementNS("http://www.w3.org/2000/svg","path");
			// from flaticon.com
			path3.setAttribute("d","M36.316,14.393l4.424-7.08c0.17-0.271,0.25-0.584,0.25-0.905V1.684C40.99,0.741,40.245,0,39.301,0h-4.494		c-0.943,0-1.739,0.741-1.739,1.684V4.22c0,0.387-0.281,0.712-0.668,0.712h-4.532c-0.387,0-0.704-0.325-0.704-0.712V1.684		C27.164,0.741,26.403,0,25.459,0h-5.484c-0.943,0-1.705,0.741-1.705,1.684V4.22c0,0.387-0.316,0.712-0.703,0.712h-4.532		c-0.387,0-0.669-0.325-0.669-0.712V1.684C12.367,0.741,11.572,0,10.628,0H6.134C5.191,0,4.446,0.741,4.446,1.684v4.724		c0,0.32,0.08,0.634,0.25,0.905l4.423,7.08c0.17,0.271,0.259,0.584,0.259,0.904v19.307c0,0.6-0.319,1.155-0.833,1.464l-3.278,1.971		c-0.514,0.309-0.821,0.864-0.821,1.465v4.246c0,0.944,0.744,1.686,1.688,1.686h33.167c0.942,0,1.688-0.741,1.688-1.686v-4.246		c0-0.601-0.305-1.156-0.818-1.465l-3.287-1.97c-0.514-0.31-0.828-0.864-0.828-1.464V15.297		C36.057,14.978,36.146,14.664,36.316,14.393z M27.163,24.426c0,0.695-0.56,1.281-1.255,1.281h-6.381		c-0.695,0-1.256-0.586-1.256-1.281v-5.483c0-2.417,1.957-4.369,4.374-4.369h0.145c2.418,0,4.373,1.952,4.373,4.369V24.426z");
			path3.setAttribute("fill","white");
			path.appendChild(path3);
			path.setAttribute("width",C);
			path.setAttribute("height",C);
			path.setAttribute("x",x-C/2);
			path.setAttribute("y",y+C/2);
//			path.setAttribute("fill","white");
//			path.setAttribute("d",hexPath(x,y+2*C/3,H/3,S/3,C/3,cornerSize,0));
			path.id = "I-"+code;
			svg.appendChild(path);
		}
	} else {		
		var path = document.createElementNS("http://www.w3.org/2000/svg","path");
		path.setAttribute("d",hexPath(x,y,H,S,C,cornerSize,-extra));
		path.setAttribute("fill","white");
		path.id = "I-"+code;
		var path2 = document.createElementNS("http://www.w3.org/2000/svg","path");
		path2.setAttribute("d",hexPath(x,y,H,S,C,cornerSize,0));
		path2.setAttribute("fill","#cfcfcf");
		path2.setAttribute("stroke","#cfcfcf");
		path2.setAttribute("stroke-width",strokeWidth)
		path2.id = "O-"+code;
		var letter = document.createElementNS("http://www.w3.org/2000/svg","text");
		letter.textContent = grid[i][j].toUpperCase();
		letter.setAttribute("x",x);
		letter.setAttribute("y",y+C-extra*C*(1-2*cornerSize));
		letter.setAttribute("font-family",'"Chantilly Serial Regular", Helvetica, sans-serif')
		letter.setAttribute("font-size",fontScale*C);
		letter.setAttribute("text-anchor","middle");
		letter.setAttribute("dominant-baseline","central");
		letter.setAttribute("pointer-events","none");
		letter.id = "A-"+code;
		path.setAttribute("pointer-events","none");
		path2.addEventListener("click",clickHandler(code));
		svg.appendChild(path2);
		svg.appendChild(path);
		svg.appendChild(letter);
	}
}

function toCode(x,y){
	return x + 7 * y;
}

function X(code){
	return code % 7;
}

function Y(code){
	return Math.floor(code/7);
}



function randomLetter(){
	return letters.splice(Math.floor(Math.random()*letters.length),1)[0];
}

/* 0: 0's. 1: 1's. 2: 0's capital 3: 1's capital. 17: inaccessible 99: not on the map. letter = letter */


function isOccupied(x,y,tentative,player){
	if(player === undefined){
		return isOccupied(x,y,tentative,0) || isOccupied(x,y,tentative,1);
	}
	if(isOffGrid(x,y)){
		return false;
	}
	if(tentative){
		if((codes.includes(toCode(x,y))) && player === currentPlayer()){
			if(connected[codes.indexOf(toCode(x,y))]){
				return true;
			}
		}
	}
	if (player === 1){
		return grid[x][y] === 1 || grid[x][y] === 3;
	} else {
		return grid[x][y] === 0 || grid[x][y] === 2;
	}
}

function isAdjacent(x,y,tentative,player){
	if(isOccupied(x,y-1,tentative,player)){
		return true;
	}
	if(isOccupied(x,y+1,tentative,player)){
		return true;
	}
	if(isOccupied(x-1,y,tentative,player)){
		return true;
	}
	if(isOccupied(x+1,y,tentative,player)){
		return true;
	}
	if(x % 2 === 0){
		return isOccupied(x-1,y-1,tentative,player) || isOccupied(x+1,y-1,tentative,player);
	} else {
		return isOccupied(x-1,y+1,tentative,player) || isOccupied(x+1,y+1,tentative,player);
	}
}

function isOffGrid(x,y){
	if(!Number.isInteger(x) || !Number.isInteger(y)){
		return true;
	}
	if(0 > x || x > 6 || 0 > y || y > 6){
		return true;
	}
	if(grid[x][y] === OFFGRID){
		return true;
	}
	return false;
}

function isLetter(x,y){
	if(isOffGrid(x,y)){
		return false;
	}
	return !Number.isInteger(grid[x][y]);
}



function currentPlayer(){
	return turn % 2;
}

function otherPlayer(){
	return (turn + 1) % 2;
}

function otherCapital(){
	return 2 + (turn + 1) % 2;
}

function announceCapture(){
	/* TODO */
}

function declareVictory(){
	gameOver = true;
}

function repopulateCapital(){
	while(true){
		let code = Math.floor(Math.random()*49);
		if(grid[X(code)][Y(code)] === otherPlayer()){
			grid[X(code)][Y(code)] = otherCapital();
			return true;
		}
	}
}

function commit(){
	if(codes.length === 0){
		return;
	}
	let capitalCaptured = false;
	let foundEnemyCapital = false;
	let stillAlive = false;
	let tempLetters = [];
	/* claim the letters that are connected to you; replace the letters that aren't */
	while(codes.length > 0){
		let code = codes.shift();
		tempLetters.push(grid[X(code)][Y(code)]);
		if(connected.shift()){
			grid[X(code)][Y(code)] = currentPlayer();
		} else {
			grid[X(code)][Y(code)] = randomLetter();
		}
	}
	/* kill any enemy letters that are adjacent to yours */
	for(let x = 0; !(x>=7); x++){
		for(let y = 0; !(y>=7); y++){
			if(grid[x][y] === otherPlayer()){
				if(isAdjacent(x,y,false,currentPlayer())){
					grid[x][y] = randomLetter();
				} else {
					stillAlive = true;
				}
			} else if(grid[x][y] === otherCapital()){
				foundEnemyCapital = true;
				if(isAdjacent(x,y,false,currentPlayer())){
					capitalCaptured = true;
					grid[x][y] = randomLetter();
				} else {
					stillAlive = true;
				}
			}
		}
	}
	/* kill any letters that are no longer touching either player; introduce new letters that are now adjacent */
	for(let x = 0; !(x>=7); x++){
		for(let y = 0; !(y>=7); y++){
			if(isLetter(x,y) && !isAdjacent(x,y)){
				tempLetters.push(grid[x][y]);
				grid[x][y] = INACCESSIBLE;
			} else if (grid[x][y] === INACCESSIBLE && isAdjacent(x,y)){
				grid[x][y] = randomLetter();
			}
		}
	}
	/* dump letters in the bag */
	while(tempLetters.length > 0){
		letters.push(tempLetters.pop());
	}
	let svg = document.getElementById("board");
	if(svg !== null){
		svg.parentNode.removeChild(svg);
	}
	
	if(!capitalCaptured && !foundEnemyCapital && stillAlive){
		repopulateCapital(otherPlayer());
	}
	
	createBoard();
	
	
	if(capitalCaptured){
		if(stillAlive){
			announceCapture();
			return false;
		} else {
			declareVictory();
			return true;
		}
	}
	if(!foundEnemyCapital && !stillAlive){
		declareVictory();
		return true;
	}
	turn++;
	return false;
}

function refresh(){
	let anything = false;
	for(j = 0; !(j>=codes.length); j++){
		let code = codes[j];
		if(!connected[j] && isAdjacent(X(code),Y(code),true,currentPlayer())){
			anything = true;
			connected[j] = true;
		}	
	}
	if(anything){
		refresh();
	} else {
		for(j = 0; !(j>=codes.length); j++){
			if(connected[j]){
				selectConnected(codes[j]);
			} else {
				selectUnconnected(codes[j]);
			}
		}
		for(code = 0; !(code>=49); code++){
			let x = X(code);
			let y = Y(code);
			if(isOccupied(x,y,true,otherPlayer())){
				if(isAdjacent(x,y,true,currentPlayer())){
					willCapture(code);
				} else {
					willNotCapture(code);
				}
			}
		}
	}
}

function selectConnected(code){
	let path = document.getElementById("I-"+code);
	let path2 = document.getElementById("O-"+code);
	let letter = document.getElementById("A-"+code);
	path.setAttribute("fill",colors[currentPlayer()]);
	path2.setAttribute("fill",darkColors[currentPlayer()]);
	path2.setAttribute("stroke",darkColors[currentPlayer()]);
	letter.setAttribute("fill","white");
}

function selectUnconnected(code){
	let path = document.getElementById("I-"+code);
	let path2 = document.getElementById("O-"+code);
	let letter = document.getElementById("A-"+code);
	path.setAttribute("fill","#808080");
	path2.setAttribute("fill","#686868");
	path2.setAttribute("stroke","#686868");
	letter.setAttribute("fill","white");
}

function deselect(code){
	let path = document.getElementById("I-"+code);
	let path2 = document.getElementById("O-"+code);
	let letter = document.getElementById("A-"+code);
	path.setAttribute("fill","white");
	path2.setAttribute("fill","#cfcfcf");
	path2.setAttribute("stroke","#cfcfcf");
	letter.setAttribute("fill","black");
}

function willCapture(code){
	let path2 = document.getElementById("O-"+code);
	path2.setAttribute("fill",lightColors[otherPlayer()]);
}

function willNotCapture(code){
	let path2 = document.getElementById("O-"+code);
	path2.setAttribute("fill",colors[otherPlayer()]);
}

function getWord(){
	let word = "";
	for(let j = 0; !(j>=codes.length); j++){
		word += grid[X(codes[j])][Y(codes[j])];
	}
	return word.toUpperCase();
}

function addLetter(code){
	let x = X(code);
	let y = Y(code);
	codes.push(code);
	if(isAdjacent(x,y,true,currentPlayer())){
		connected.push(true);
		selectConnected(code);
		refresh();
	} else {
		connected.push(false);
		selectUnconnected(code);
	}
	document.getElementById("word").textContent = getWord();
}

function removeLetter(code){
	if(codes.includes(code)){
		deselect(code);
		let index = codes.indexOf(code);
		codes.splice(index,1);
		if(connected.splice(index,1)[0]){
			for(let j = 0; !(j>=connected.length); j++){
				connected[j] = false;
			}
			refresh();
		}
	}
	document.getElementById("word").textContent = getWord();
}

var grid = [];
for(let j = 0; !(j>=7); j++){
	grid.push([]);
	for(let k = 0; !(k>=7); k++){
		grid[j].push(INACCESSIBLE);
	}
}
grid[0][0] = OFFGRID;
grid[2][0] = OFFGRID;
grid[4][0] = OFFGRID;
grid[6][0] = OFFGRID;
grid[1][1] = 2;
grid[5][5] = 3;

letters = [
	"e","e","e","e","e","e","e","e","e","e","e","e",
	"a","a","a","a","a","a","a","a","a",
	"i","i","i","i","i","i","i","i","i",
	"o","o","o","o","o","o","o","o",
	"n","n","n","n","n","n",
	"r","r","r","r","r","r",
	"t","t","t","t","t","t",
	"l","l","l","l",
	"s","s","s","s",
	"u","u","u","u",
	"d","d","d","d","g","g","g",
	"b","b","c","c","m","m","p","p",
	"f","f","h","h","v","v","w","w","y","y",
	"k","j","x","q","z"];

grid[0][1] = randomLetter();
grid[0][2] = randomLetter();
grid[1][0] = randomLetter();
grid[1][2] = randomLetter();
grid[2][1] = randomLetter();
grid[2][2] = randomLetter();
grid[4][5] = randomLetter();
grid[4][6] = randomLetter();
grid[5][4] = randomLetter();
grid[5][6] = randomLetter();
grid[6][5] = randomLetter();
grid[6][6] = randomLetter();


window.addEventListener("load",createBoard);
