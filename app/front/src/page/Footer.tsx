import React from 'react'
import Box from '@mui/material/Box';

function Footer(props: any)
{
	const sx_footer = {
		color: 'primary.main',
		backgroundColor: 'white',
		position: "fixed",
		height: 'auto',
		width: '100%',
		textAlign: "center",
		m: 'auto',
		p: 'auto',
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'center',
		alignItems: 'stretch'
	};

console.log('On commence a jouer avec l\'api');

//fetch();
	return (
		<Box component="footer" sx={sx_footer}>
			Powered by {props.mate1}, {props.mate2}, {props.mate3}, {props.mate4}.
		</Box>
	);
}
export default Footer;