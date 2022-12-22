import React from 'react'
import Box from '@mui/material/Box';
import AvatarMate from '../component/AvatarMate'

function Mate(props: any)
{
	const {login, avatar} = props;
	const sx_main = {
		display: 'flex',
		flexFlow: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	};
	

	return (
		<Box component="div" sx={sx_main}>
			<AvatarMate avatar={avatar} />
			<Box component="div">
				{login}
			</Box>
		</Box>
	);
}

export default Mate;