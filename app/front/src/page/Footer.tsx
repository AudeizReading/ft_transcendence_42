import React from 'react';
import Box from '@mui/material/Box';
import MatesList from '../component/MatesList';

// pour prop avatar, il faudra fetch l'url de nos pp, donc appel a l'api 42, j'ai pas encore compris comment je vais chopper ca
const mates = [
	{
		login: 'gphilipp',
		avatar: ''
	},
	{
		login: 'alellouc',
		avatar: ''
	},
	{
		login: 'achansel',
		avatar: ''
	},
	{
		login: 'pbremond',
		avatar: ''
	},
];


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
		display: {xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex'},
		justifyContent: 'center',
	};

	return (
		<Box component="footer" sx={sx_footer}>
			<MatesList mates={mates} />
		</Box>
	);
}

export default Footer;