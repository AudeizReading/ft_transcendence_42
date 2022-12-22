import React from 'react'
import Box from '@mui/material/Box';

// Attention pour le moment l'url est pas du connectee a la pp
function AvatarMate(props: any)
{
	const {avatar} = props;
	const sx_avatar = {
		width: 40,
		height: 40,
		borderRadius: '50%',
		backgroundColor: 'secondary.main',
		wrap: 'noWrap'
	};

	return (
		<Box component="div" sx={sx_avatar}>
				{avatar}
				<img src={avatar}/>
		</Box>
	);
}

export default AvatarMate;