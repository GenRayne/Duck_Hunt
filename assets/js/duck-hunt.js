document.addEventListener('DOMContentLoaded', function () {

	document.addEventListener('click', startGame);

	var wrapper = document.querySelector('.wrapper'),
		audio   = document.getElementById('audio'),
		text 	= document.querySelector('.text'),
		timer   = document.querySelector('.timer'),
		ammo    = document.querySelector('.ammo'),

		restartBtn    = document.querySelector('.restart-btn'),
		nextBtn 	  = document.querySelector('.next-btn'),
		roundsCounter = 1,

		wrapperWidth  = parseInt(getComputedStyle(wrapper).width),
		wrapperHeight = parseInt(getComputedStyle(wrapper).height),

		sky 	  = document.querySelector('.sky-container'),
		maxHeight = parseInt(getComputedStyle(sky).height) - 95,
		maxWidth  = parseInt(getComputedStyle(sky).width) - 104,

		dog   = document.querySelector('.dog'),
		ducks = [],

		ducksInitialQuantity   = 0,
		bulletsInitialQuantity = 0,
		initialTime = 3,

		totalDucks = 0,
		totalShotDucks = 0,
		totalSurvivedDucks = 0,

		shotDuckCounter  = 0,
		aliveDuckCounter = 0,
		score = '',

		bullets      = [],
		flyIntervals = [],

		newX = 0,
		newY = 0,
		flyClasses = ['duck_fly_left', 'duck_fly_top_left', 'duck_fly_right', 'duck_fly_top_right'];

	nextBtn.addEventListener('click', function () {
		newRound(ducksInitialQuantity + 2, bulletsInitialQuantity + 3, initialTime + 3);
	});
	restartBtn.addEventListener('click', function () {
		location.reload();
	});

	function startGame () {
		document.removeEventListener('click', startGame);
		document.addEventListener('click', shootDucks.bind(event));
		text.textContent = '';

		dog.classList.add('dog_walk');
		dog.style.MsTransform = 'translate(45vw, 0px)';
		dog.style.transform = 'translate(45vw, 0px)';

		setTimeout(dogJump, 3000);
	}

	function dogJump () {
		bark.play();
		dog.classList.remove('dog_walk');		
		dog.classList.add('dog_jump');

		dog.style.MsTransform = 'translate(47vw, -100px)';
		dog.style.transform = 'translate(47vw, -100px)';

		dog.addEventListener('transitionend', function() {
			dog.style.zIndex = 4;
			dog.style.MsTransform = 'translate(48vw, 0px)';
			dog.style.transform = 'translate(48vw, 0px)';
			dog.style.transition = 'transform 1s';
		});

		setTimeout(function () {
			createText('Round 1');
			startRound(3, 7);
			runTimer(5);
		}, 1500);
	}

	function runTimer (seconds) {
		if (seconds > 9) {
			timer.textContent = '00:' + seconds.toString();
		} else {
			timer.textContent = '00:0' + seconds.toString();
		}
		
		setTimeout(function () {
			if (seconds < 1) {
				endRound('Time\'s up!');
				return;
			} else if (aliveDuckCounter < 1) {
				endRound(' ');
				return;
			}
			seconds--;
			runTimer(seconds);
		}, 1000);
	}

	function endRound (firstLineText) {
		wrapper.style.backgroundColor = '#977EC7';
		text.textContent = '';
		createText(firstLineText);
		for (let i = 0; i < flyIntervals.length; i++) {
			clearInterval(flyIntervals[i]);
		}
		ducks = document.querySelectorAll('.alive');
		for (let i = 0; i < ducks.length; i++) {
			ducks[i].classList.add('duck_fly_top_right');
			ducks[i].style.bottom = 'calc(100% + 100px)';
			ducks[i].style.left = parseInt(getComputedStyle(ducks[i]).left) + 200 + 'px';
		}
		setTimeout(gameOver, 1500);
	}

	function startRound (ducksQuantity, bulletsQuantity) {
		createDucks(ducksQuantity);
		createBullets (bulletsQuantity);

		ducks = document.querySelectorAll('.alive');
		ducksInitialQuantity = ducks.length;
		totalDucks += ducksInitialQuantity;
		aliveDuckCounter = ducks.length;

		bullets = document.querySelectorAll('.available');
		bulletsInitialQuantity = bullets.length;

		for (let i = 0; i < ducks.length; i++) {
			ducks[i].classList.add('duck_fly');
			setTimeout(function () {
				newX = Math.floor(Math.random() * maxWidth);
				newY = Math.floor(Math.random() * maxHeight);
				duckChangeDirection(ducks[i]);
				ducks[i].style.left = newX + 'px';
				ducks[i].style.bottom = newY + 'px';
			}, 100);
		}

		var flyInterval = setInterval(function () {
			flyToRandomCoordinates(ducks);
		}, 1000);
		flyIntervals.push(flyInterval);
	}

	function flyToRandomCoordinates (ducks) {
		for (let i = 0; i < ducks.length; i++) {
			if (ducks[i].classList.contains('shot')) {
				continue;
			}
			newX = Math.floor(Math.random() * maxWidth);
			newY = Math.floor(Math.random() * maxHeight);
			duckChangeDirection(ducks[i]);
			ducks[i].style.left = newX + 'px';
			ducks[i].style.bottom = newY + 'px';
		}
	}

	function duckChangeDirection (duck) {
		removeFlyClasses(duck);
		chooseDirection(duck);
		function chooseDirection (duck) {
			if ( newX < parseInt(getComputedStyle(duck).left) ) {
				if ( newY <= parseInt(getComputedStyle(duck).bottom + 50) ) {
					duck.classList.add('duck_fly_left');
				} else {
					duck.classList.add('duck_fly_top_left');
				}
			} else {
				if ( newY <= parseInt(getComputedStyle(duck).bottom) + 50 ) {
					duck.classList.add('duck_fly_right');
				} else {
					duck.classList.add('duck_fly_top_right');
				}
			}
		}
	}

	function gameOver () {
		createText('Round ' + roundsCounter + ' complete', 'end-text');
		totalShotDucks += shotDuckCounter;
		totalSurvivedDucks += aliveDuckCounter;

		score = createText('');

		switch (shotDuckCounter) {
			case 0:
				score.textContent += 'You shot no ducks!';
				break;
			case 1:
				score.textContent += 'You shot ' + shotDuckCounter + ' duck! ';
				break;
			case ducksInitialQuantity:
				score.textContent += 'You shot all the ducks!';
				break;
			default:
				score.textContent += 'You shot ' + shotDuckCounter + ' ducks! ';
				break;
		}
		switch (aliveDuckCounter) {
			case 0:
				break;
			case 1:
				score.textContent += (aliveDuckCounter + ' duck escaped this deplorable fate.');
				break;
			case ducksInitialQuantity:
				score.textContent += '';
				break;
			default:
				score.textContent += (aliveDuckCounter + ' ducks escaped this deplorable fate.');
				break;
		}
		dogWithDucks();
	}

	function dogWithDucks () {
		dog.classList.remove('dog_jump');
		switch(shotDuckCounter) {
			case 0:
				dog.classList.add('no_ducks');
				setTimeout(function () { giggle.play(); }, 1000);
				break;
			case 1:
				dog.classList.remove('show_ducks');
				dog.classList.add('show_duck');
				dog.style.MsTransform = 'translate(48vw, -100px)';
				dog.style.transform = 'translate(48vw, -100px)';
				break;
			default:
				dog.classList.add('show_ducks');
				dog.style.MsTransform = 'translate(48vw, -100px)';
				dog.style.transform = 'translate(48vw, -100px)';
				break;
		}
		setTimeout(continueOrRestart, 1000);
	}

	function continueOrRestart () {
		if (roundsCounter < 5) {
			createText('Click the button on the right to move on to the next Round');
			nextBtn.style.visibility = 'visible';
			nextBtn.style.opacity = '1';
		} else {
			gameOverSound.play();
			createText('GAME OVER', 'end-text');

			switch (totalShotDucks) {
				case 0:
					createText('You shot no ducks at all! That\'s weird...');
					break;
				case totalDucks:
					createText('Wow, you shot all the ducks. Impressive!');
					break;
				default:
					createText('Ducks shot: ' + totalShotDucks + '. Ducks survived: ' + totalSurvivedDucks + '.');
					break;
			}
			setTimeout (function () {
				restartBtn.style.visibility = 'visible';
				restartBtn.style.opacity = '1';
			}, 1000);
		}
	}

	function shootDucks () {
		if (bullets.length < 1 || event.target === nextBtn || event.target === restartBtn) {
			return;
		}

		var lastBullet = bullets.length - 1;

		shot.pause();
		shot.currentTime = 0;
		shot.play();
		
		bullets[lastBullet].classList.remove('available');
		bullets = document.querySelectorAll('.available');

		if ( event.target.classList.contains('alive') ) {
			duck = event.target;

			duck.classList.remove('alive');
			duck.classList.add('shot');
			removeFlyClasses(duck);

			duck.style.left = getComputedStyle(duck).left;
			duck.style.bottom = getComputedStyle(duck).bottom;

			shotDuckCounter ++;
			aliveDuckCounter --;

			setTimeout(function () {
				duck.classList.add('falling');
				duck.style.bottom = -150 + 'px';
			}, 300);
		}
	}

	function removeFlyClasses(duck) {
		for (let i = 0; i < flyClasses.length; i++) {
			duck.classList.remove(flyClasses[i]);
		}
	}

	function newRound (ducksQuantity, bulletsQuantity, seconds) {
		nextBtn.style.opacity = '0';
		setTimeout(function () {
			nextBtn.style.visibility = 'hidden';
		}, 500);

		roundsCounter++;
		initialTime = seconds;
		shotDuckCounter = 0;
		aliveDuckCounter = 0;

		bullets = document.querySelectorAll('.bullet');
		for (let i = 0; i < bullets.length; i++) {
			ammo.removeChild(bullets[i]);
		}
		ducks = document.querySelectorAll('.duck');
		for (let i = 0; i < ducks.length; i++) {
			sky.removeChild(ducks[i]);
		}
		
		text.textContent = '';
		createText('Round ').textContent += roundsCounter;
		wrapper.style = '';

		setTimeout(function () {
			startRound(ducksQuantity, bulletsQuantity);
			runTimer(seconds);
		}, 1000);
	}

	function createText (newText, CSSclass) {
		var newP = document.createElement('p');
		if (CSSclass) {
			newP.classList.add(CSSclass);
		}
		newP.textContent = newText;
		text.appendChild(newP);
		return newP;
	}

	function createDucks (quantity) {
		for (let i = 1; i <= quantity; i++) {
			var newDuck = document.createElement('div');
			newDuck.classList = 'duck gs alive';
			sky.appendChild(newDuck);
		}
	}

	function createBullets (quantity) {
		for (let i = 1; i <= quantity; i++) {
			var newBullet = document.createElement('div');
			newBullet.classList = 'bullet gs available';
			ammo.appendChild(newBullet);
		}
	}
});