// JavaScript to handle scroll events
let scrollTimeout;

window.addEventListener('scroll', function () {
	// Add a class to body when scrolling
	document.body.classList.add('scroll-active');

	// Clear the timeout to avoid flickering
	clearTimeout(scrollTimeout);

	// Set a timeout to remove the class after a delay (e.g., 2 seconds)
	scrollTimeout = setTimeout(function () {
		document.body.classList.remove('scroll-active');
	}, 2000); // Adjust the delay as needed
});
