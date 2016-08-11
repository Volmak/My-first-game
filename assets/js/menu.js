/**
 * 
 */

document.getElementById('highscores').addEventListener('click', function(){
	alert("Ivan Stefanov: 71pts");
	alert("This game was created as a homework, it had to end at 70 pts, sry");
}, false);

document.getElementById('quit').addEventListener('click', function(){
	alert("I don't think it's possible to close a tab, but the link stays on in case of further development");
}, false);

document.addEventListener('click', function () {
	var inTheAir = 0;
	for(var i = 1; i < 5; i++){
		var bullet = document.getElementById(i);
		if(bullet.style.display == 'block') {
			inTheAir++;
			if(inTheAir >= 4) {
				return;
			}
			continue;
		}
		break;
	}
	var right = window.innerWidth - choper.x - choper.width;
	bullet.style.right = right + 35/*rocket lenght*/ + "px";
	bullet.style.top = choper.y + 30 + 'px';
	bullet.style.display = 'block';
	
    rocketSound.currentTime = 0;
	rocketSound.play();
}, false)

var helicopterSound = document.getElementById('background-sound');
var rocketSound = document.getElementById('rocket-sound');
var explosionSound = document.getElementById('explosion-sound');

var choper = {
	x: 0,
	nextX: 0,
	y: 0,
	nextY: 0,
	height: 155,
	width: 140,
	speed: 2,
	dom: document.getElementById('choper'),
}

function boomClick (URL) {
	explosionSound.currentTime = 0;
	explosionSound.play();
	setTimeout( function() { window.location = URL }, 1500 );
}

function randomMovement () {
	if (choper.nextX < choper.x + choper.speed && choper.nextX > choper.x - choper.speed) {
		choper.nextX = Math.floor(Math.random() * window.innerWidth / 3);
	}
	if (choper.nextY < choper.y + choper.speed && choper.nextY > choper.y - choper.speed) {
		choper.nextY = Math.floor(Math.random() * (window.innerHeight - choper.height));
	}
	
	if (choper.x > choper.nextX) {
		choper.x -= choper.speed;
	}
	if (choper.x < choper.nextX) {
		choper.x += choper.speed;
	}
	choper.dom.style.left = choper.x + 'px';

	if (choper.y > choper.nextY) {
		choper.y -= choper.speed / 2;
	}
	if (choper.y < choper.nextY) {
		choper.y += choper.speed / 2;
	}
	choper.dom.style.top = choper.y + 'px';	
	
	for(var i = 1; i < 5; i++){
		var bullet = document.getElementById(i);
		if(bullet.style.display != 'block') {
			continue;
		}
		var bulletX = parseInt(bullet.style.right) - 10;
		if (bulletX <= 45) {
			bullet.style.display = 'none';
		}
		bullet.style.right = bulletX + 'px';
	}
	
	helicopterSound.play();
	
	requestAnimationFrame(randomMovement);
}

requestAnimationFrame(randomMovement);