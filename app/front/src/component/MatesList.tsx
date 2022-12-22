import React from 'react';
import Box from '@mui/material/Box';
import Mate from '../component/Mate';

function MatesList(props: any)
{
	const {mates} = props;
	return (
		<Box component="div" sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '35%', p: '0.15em', m: '0.25em'}}>
			<Box component='span'>Powered By </Box>
			{
				mates.map(
					(mate: any) => (<Mate key={mate.login} login={mate.login}/>)
				)
			}
		</Box>
		);
}

export default MatesList;