let currentSong = new Audio();
let songs;
let source;
let currFolder;
let logIn;
function convertSecondsToMinutes(seconds) {
	if (isNaN(seconds) || seconds < 0) {
		return '00 : 00';
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	const formattedMinutes = String(minutes).padStart(2, '0');
	const formattedSeconds = String(remainingSeconds).padStart(2, '0');

	return `${formattedMinutes} : ${formattedSeconds}`;
}
async function getSongs(folder) {
	currFolder = folder;
	let a = await fetch(`/${folder}/`);
	let response = await a.text();
	let div = document.createElement('div');
	div.innerHTML = response;
	let as = div.getElementsByTagName('a');
	songs = [];
	for (let i = 0; i < as.length; i++) {
		const element = as[i];
		if (element.href.endsWith('mp3')) {
			songs.push(element.href.split(`/${folder}/`)[1]);
		}
	}
	let songUl = document
		.querySelector('.songList')
		.getElementsByTagName('ul')[0];
	songUl.innerHTML = '';
	for (const song of songs) {
		songUl.innerHTML =
			songUl.innerHTML +
			`<li>
				<img
									class="invert"
									width="25px"
									src="./images/music.svg"
									alt=""
								/>
								<div class="info">
									<div>${song.replaceAll('%20', ' ').replaceAll('.mp3', '')}</div>
									
								</div>
								<div class="playNow">
									<img
										class="playNowImg"
										
										src="./images/playNow.svg"
										alt=""
									/>
								</div>
				
				</li>`;
	}
	//Attach a event listner to each song
	let songList = document.querySelector('.songList').getElementsByTagName('li');
	Array.from(songList).forEach((e) => {
		e.addEventListener('click', (element) => {
			source = 'songList';
			playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
			play.src = './images/pause.svg';
		});
	});
	//songList.style.pointerEvents = 'none';
	return songs;
}
const playMusic = (track, pause = false) => {
	// let audio = new Audio('/Songs/' + track + '.mp3');
	// currentSong.src = '/Songs/' + track + '.mp3';
	if (logIn === 'done') {
		if (source === 'nextBtn' || source === 'prevBtn' || source === 'card') {
			currentSong.src = `/${currFolder}/` + track;
			currentSong.play();
			play.src = './images/pause.svg';
		} else if (source === 'songList') {
			currentSong.src = `/${currFolder}/` + track + '.mp3';
			currentSong.play();
		} else {
			currentSong.src = `/${currFolder}/` + track;
		}
	} else {
		currentSong.src = `/${currFolder}/` + track;
	}
	document.querySelector('.songInfo').innerHTML = decodeURI(
		track.replace('.mp3', ''),
	);
	document.querySelector('.songTime').innerHTML = '00 : 00 / 00 : 00';
};
async function displayAlbums() {
	let folder;
	console.log('displaying');
	let a = await fetch(`/songs`);
	let response = await a.text();
	let div = document.createElement('div');
	div.innerHTML = response;
	console.log(response);
	let anchors = div.getElementsByTagName('a');
	console.log(anchors);
	cardContainer = document.querySelector('.cardContainer');
	let array = Array.from(anchors);
	console.log(array);
	for (let index = 0; index < array.length; index++) {
		const event = array[index];
		if (event.href.includes(`/songs/`) && !event.href.includes('.htaccess')) {
			folder = event.href.split('/songs/').slice(-2)[1];
			// Get the metadata of the folder
			let a = await fetch(`/songs/${folder}/info.json`);
			let response = await a.json();
			cardContainer.innerHTML =
				cardContainer.innerHTML +
				`<div data-folder="${folder}" class="card">
			<div class="play">
				<svg
					data-encore-id="icon"
					role="img"
					aria-hidden="true"
					viewBox="0 0 24 24"
					class="Svg-sc-ytk21e-0 iYxpxA"
				>
					<path
						d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
					></path>
				</svg>
			</div>
			<img
				src="/songs/${folder}/cover.jpg"
				alt=""
			/>
			<h2>${response.title}</h2>
			<p>${response.description}</p>
		</div>`;
		}
	}

	//Load the playlist whenever card is clicked
	Array.from(document.getElementsByClassName('card')).forEach((e) => {
		e.addEventListener('click', async (item) => {
			source = 'card';
			songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
			playMusic(songs[0]);
		});
	});
}
async function main() {
	//Get the list of songs
	await getSongs('songs/cs');
	playMusic(songs[0]);

	// Display All the albums on the page
	displayAlbums();
	// Attach an event listener to play,next and previous
	let play = document.getElementById('play');
	source = 'songList';
	play.addEventListener('click', () => {
		if (currentSong.paused) {
			currentSong.play();
			play.src = './images/pause.svg';
		} else {
			currentSong.pause();
			play.src = './images/play.svg';
		}
	});
	currentSong.addEventListener('timeupdate', () => {
		document.querySelector('.songTime').innerHTML = `${convertSecondsToMinutes(
			currentSong.currentTime,
		)} / ${convertSecondsToMinutes(currentSong.duration)} `;
		const newPosition =
			(currentSong.currentTime / currentSong.duration) * 100 + '%';
		document.querySelector('.circle').style.left = newPosition;
		document.querySelector('.progress').style.width = newPosition;
		if (currentSong.ended) {
			source = 'nextBtn';
			let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
			if (index + 1 < songs.length) {
				playMusic(songs[index + 1]);
			} else {
				play.src = './images/play.svg';
			}
		}
	});
	//Add an event listener to seekbar
	document.querySelector('.seekbar').addEventListener('click', (e) => {
		let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
		document.querySelector('.circle').style.left = percent + '%';
		currentSong.currentTime = (currentSong.duration * percent) / 100;
	});
	document.querySelector('.seekbar').addEventListener('mouseenter', (e) => {
		document.querySelector('.circle').classList.add('active');
		document.querySelector('.progress').style.backgroundColor = '#1fdf64';
	});
	document.querySelector('.seekbar').addEventListener('mouseleave', (e) => {
		document.querySelector('.circle').classList.remove('active');
		document.querySelector('.progress').style.backgroundColor = 'white';
	});
	//Add an event listener for hamburger
	document.querySelector('.hamburger').addEventListener('click', () => {
		document.querySelector('.left').style.left = '0';
	});
	document.querySelector('.close').addEventListener('click', () => {
		document.querySelector('.left').style.left = '-130%';
	});
	//Add an event litener to previous
	previous.addEventListener('click', () => {
		source = 'prevBtn';
		let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
		if (index - 1 >= 0) {
			playMusic(songs[index - 1]);
		} else {
			playMusic(songs[songs.length - 1]);
		}
	});
	//Add an event litener to next
	next.addEventListener('click', () => {
		source = 'nextBtn';
		let index = songs.indexOf(
			currentSong.src.split('/').slice(-1)[0],
			// .replaceAll('.mp3.mp3', '.mp3'.replaceAll(' ', '')),
		);
		if (index + 1 < songs.length) {
			playMusic(songs[index + 1]);
		} else {
			playMusic(songs[0]);
		}
	});
	// Add an event to volume
	document
		.querySelector('.range')
		.getElementsByTagName('input')[0]
		.addEventListener('change', (e) => {
			currentSong.volume = parseInt(e.target.value) / 100;
			if (currentSong.volume === 0) {
				document.querySelector('.volume>img').src = './images/mute.svg';
			} else {
				document.querySelector('.volume>img').src = './images/volume.svg';
			}
		});
	document.querySelector('.volume>img').addEventListener('click', (e) => {
		if (e.target.src.includes('volume.svg')) {
			currentSong.volume = 0;
			document.querySelector('.volume>img').src = './images/mute.svg';
			document
				.querySelector('.range')
				.getElementsByTagName('input')[0].value = 0;
			document
				.querySelector('.range')
				.getElementsByTagName('input')[0].value = 0;
		} else {
			currentSong.volume = 0.5;
			document.querySelector('.volume>img').src = './images/volume.svg';
			document
				.querySelector('.range')
				.getElementsByTagName('input')[0].value = 50;
		}
	});
	document.querySelector('.loginBtn').addEventListener('click', (e) => {
		logIn = 'done';
		document.querySelector('.playbar').style.display = 'block';
		document.querySelector('.loginBtn').innerText = 'Log out';
		//document.querySelector('.loginTxt').style.display = 'none';
		document.querySelector('.loginTxt').classList.add('none');
		document.querySelector('.songList').classList.add('pointer');
	});
	document.querySelector('.loginTxtLink').addEventListener('click', (e) => {
		logIn = 'done';
		document.querySelector('.playbar').style.display = 'block';
		document.querySelector('.loginBtn').innerText = 'Log out';
		document.querySelector('.loginTxt').style.display = 'none';
		//document.querySelector('.loginTxt').classList.add('none');
		document.querySelector('.songList').classList.add('pointer');
	});
}
main();
