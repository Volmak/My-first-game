
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_SHOOT = 32;

const BULLET_W = 24;
const BULLET_H = 124;
const BULLET_SPEED = 10;
const BULLET_POOL_LEN = 15;
var fireInterval = 1000;

const PLANE_TOP = 165;
const TARGET_W = 128;
const TARGET_H = 129;
const TARGET_HITBOX_L = 22;			// 46 - BULLET_W
const TARGET_HITBOX_R = 79;
// in case of helicopter image change values of TARGET_HITBOX_L, TARGET_HITBOX_R, plane.hitboxL, plane.hitboxR have to be adjusted

var bullets = [];
var lastTimeShot;
var targets = [];
var numberOfTargets = 4;
var spawnOnTheLeft = false;

var ammo = 100;
var ammoEl = document.getElementById('ammo');
var points = 0;
var pointsEl = document.getElementById('points');
var health = document.getElementById('health');
var endGameMessage = '';

var helicopterSound = document.getElementById('background-sound');
var rocketSound2 = document.getElementById('rocket-sound');
var rocketSound = document.getElementById('rocket-sound2');
var explosionSound = document.getElementById('explosion-sound');

var plane = {
	x: 0,
	width: 145,
	height: 165,
	hitboxL: 26,				//50 - BULLET_W,
	hitboxR: 90,
	moveLeft: false,
	moveRight: false,
	shooting: false,
	speed: 3,
	hp: 10,
	dom: document.getElementById('plane')
};

for (var i = 0; i < numberOfTargets; i++) {
    targets.push({
        on: false,
		x: 0,
		nextX: 0,
		y: 0,
		nextY: 0,
//		width: 129,
//		height: 128,
		speed: 1,
		hp: 10,
		dom: document.getElementById('target' + i)
    	}
    )
};

function createBullets() {
	for (var i = 0; i < BULLET_POOL_LEN; i++) {
		var dom = document.createElement('div');
		dom.className = 'bullet';
		dom.style.display = 'none';
		document.body.appendChild(dom);
		var b = {
				dom: dom,
				isShot: false,
				x: 0,
				y: 0,
				up: 1
		}
		bullets.push(b);
	}
}

						/* PLANE SECTION */

function attachKeyEvents () {
	document.addEventListener('keydown', function (event) {
		onKeyEvent(event.keyCode, true);
		
	}, false)
	document.addEventListener('keyup', function (event) {
		onKeyEvent(event.keyCode, false);	
		
	}, false)
	
}

function onKeyEvent (keyCode , state) {
	
	if(keyCode == KEY_LEFT){
		plane.moveLeft = state;
	}
	if(keyCode == KEY_RIGHT){
		plane.moveRight = state;
	}
	
	if(keyCode == KEY_SHOOT){
		plane.shooting = state;
	}
}

function movePlane () {
	var windowWidth = window.innerWidth;
	if(plane.moveLeft && plane.x > plane.speed){
		plane.x -= plane.speed;
	}
	
	if(plane.moveRight && plane.x < windowWidth - plane.width){
		plane.x += plane.speed;
	}
	
	plane.dom.style.left = plane.x  + 'px';
}

						/* SHOOTING SECTION */

// createBullets() - in declaration section

function shoot () {
	if(!plane.shooting) {
		return;
	}
	
	var currentTime = Date.now();
	if (lastTimeShot && currentTime - lastTimeShot < fireInterval) {
		return;
	}
	
	var bullet = getFirstFreeBullet();
	if(!bullet){
		return;
	}
	
	var top = window.innerHeight - PLANE_TOP - BULLET_W;
	bullet.dom.style.top = top +"px";
	bullet.y = top;
	bullet.up = 1;
	
	bullet.x = plane.x + plane.width /2 - BULLET_W / 2; 
	bullet.dom.style.left = bullet.x + 'px';
	bullet.dom.style.display = 'block';
	bullet.isShot = true;
	if(bullet.dom.style.transform) {
		bullet.dom.style.transform = 'rotate(0deg)';
	}
	
	ammo--;
	ammoEl.innerHTML = 'Ammo: ' + ammo;
	if (ammo < 0 ) {
		endGameMessage = 'You ran out of Ammo. Now all is LOST!';
		gameOver ();
	}

    rocketSound.currentTime = 0;
	rocketSound.play();
	lastTimeShot = currentTime;	
}

function getFirstFreeBullet() {
	for(var i = 0; i < bullets.length; i++){
		if(!bullets[i].isShot) {
			return bullets[i];
		}
	}
}

function moveBullets () {
	for(var i = 0; i < bullets.length; i++){
	var b = bullets[i];
	
	if(!b.isShot){
		continue;
	}
	
	if((b.y <= 0 || b.y >= window.innerHeight - BULLET_H) && b.isShot || hit(b)){
		b.isShot = false;
		b.dom.style.display = 'none';
		continue;
	}
	
	b.y -= BULLET_SPEED * b.up;
	b.dom.style.top = b.y + 'px';
	}
}

function hit(b) {
	for(var i = 0; i < targets.length; i++){
		if(!targets[i].on) {
			continue;
		}
		var target = targets[i];
		if (b.up > 0 && b.x < TARGET_HITBOX_R + target.x && b.x > TARGET_HITBOX_L + target.x && b.y < target.y + TARGET_H && b.y > target.y) {
			points++;
			if (points >= 70) {
				endGameMessage = 'CONGRATULATIONS! You scored 70 points and WON!'
				gameOver ();
			}
			pointsEl.innerHTML = "Points: " + points;
			target.hp--;
			target.dom.innerHTML = target.hp;
			if (target.hp <= 0) {
				kill (target);
			}
			return true;
		}
		if (points % 5 == 0) {
			bonus ();
		}
	}
	
	var planeY = window.innerHeight - PLANE_TOP;
	if (b.up < 0 && b.x < plane.hitboxR + plane.x && b.x > plane.hitboxL + plane.x && b.y + BULLET_H < planeY + plane.height && b.y + BULLET_H > planeY) {
		plane.hp--;
		health.innerHTML = 'Health: ' + plane.hp;
		if (plane.hp <= 0) {
			endGameMessage = 'You have been KILLED in action R.I.P.';
			explosionSound.play();
			gameOver();
		}
		return true;
	}
	
	return false;
}

// kill () & bonus () - in targets section
// gameOver() - in essentials

						/* TARGETS SECTION */

function randomMovement () {
	for (var i = 0; i < numberOfTargets; i++){
		var target = targets[i];
		target.speed += 0.0002;
		if (target.on == false) {
			continue;
		}
		if (target.nextX < target.x + target.speed && target.nextX > target.x - target.speed) {
			target.nextX = Math.floor(Math.random() * (window.innerWidth - TARGET_W));
	//	}
	//	if (target.nextY < target.y + target.speed && target.nextY > target.y - target.speed) {
	// With this line removed we get random horizontal movements from time to time
			target.nextY = Math.floor(Math.random() * (window.innerHeight - TARGET_H) / 2);
			shootBack (target);
		}
		
		if (target.x > target.nextX) {
			target.x -= target.speed;
		}
		if (target.x < target.nextX) {
			target.x += target.speed;
		}
		target.dom.style.left = target.x + 'px';
	
		if (target.y > target.nextY) {
			target.y -= target.speed / 2;
		}
		if (target.y < target.nextY) {
			target.y += target.speed / 2;
		}
		target.dom.style.top = target.y + 'px';	
	}
}

function shootBack (target) {
		
	var bullet = getFirstFreeBullet();
	if(!bullet){
		return;
	}
	
	bullet.up = -1;
	bullet.y = target.y + TARGET_H + 5 - BULLET_H;	
	bullet.dom.style.top = bullet.y + "px";
	bullet.x = target.x + TARGET_W /2 - BULLET_W / 2; 
	bullet.dom.style.left = bullet.x + 'px'; 
	bullet.dom.style.display = 'block';
	bullet.isShot = true;
	bullet.dom.style.transform = 'rotate(180deg)';
    rocketSound2.currentTime = 0;
	rocketSound2.play();
}

function kill(target) {
	explosionSound.play();
	target.on = false;
	target.dom.style.display = 'none';
	target.hp = 10;
	respawn ();
	respawn ();
}

function respawn() {
	for(var i = 0; i < targets.length; i++){
		if(targets[i].on) {
			continue;
		}
		targets[i].on = true;
		targets[i].dom.style.display = 'block';
		targets[i].speed < 5 ? targets[i].speed += 1 : targets[i].speed = 4;
		targets[i].y = 0
		targets[i].dom.style.top = targets[i].y + 'px';
		if(spawnOnTheLeft) {
			targets[i].x = 0;
			targets[i].nextX = 0;
			spawnOnTheLeft = false;
		} else {			
			targets[i].x = window.innerWidth - TARGET_W;
			targets[i].nextX = targets[i].x;
			spawnOnTheLeft = true;
		}
		targets[i].dom.style.left = targets[i].x + 'px';
		targets[i].dom.innerHTML = targets[i].hp;
		
		return;
	}
}

function bonus () {
	
};

						/* ESSENTIALS */

function gameLoop () {
	movePlane();
	shoot();
	moveBullets();
	randomMovement ();
	helicopterSound.play();
	requestAnimationFrame(gameLoop);
}

function gameOver () {
	helicopterSound.pause();
	endGameMessage += '\n Would you like to start a NEW GAME?'
	var restart = confirm(endGameMessage);
	if (restart) {
		location.reload ();
	} else {
		window.open('index.html', '_self');
	}	
}


attachKeyEvents();
createBullets();
respawn();
requestAnimationFrame(gameLoop);