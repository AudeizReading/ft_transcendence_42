import {useState, useEffect} from 'react'


/*
Hook giving the current size of the browser winow.
Return an object with the width and the height of the window.
If we are on server-side, the size is null
*/

function useWindowSize() {

	const [windowSize, setWindowSize] = useState({
		width: 0,
		height: 0,
	});

	// Effect called only on mounting
	useEffect(() => {

		// handler for the resize
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		// Add event listener
		window.addEventListener('resize', handleResize);

		// call the handler for update the size with init window size
		handleResize();

		// cleanup the event listener
		return (() => window.removeEventListener('resize', handleResize));
	}, []);

	return windowSize;
}

export default useWindowSize;