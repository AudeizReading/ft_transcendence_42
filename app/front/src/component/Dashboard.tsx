import React from 'react';
import { useState, useEffect, useRef } from 'react';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import { Doughnut } from 'react-chartjs-2';

import { User } from '../interface/User';

import Score from '../page/Score';

import { fetch_opt } from '../dep/fetch'

const BoxPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0,0,0,0.4)',
  color: 'white',
  ...theme.typography.body2,
  width: '92%',
  height: 'auto',
  borderRadius: 20,
  marginTop: '9.5vi',
  marginBottom: '9.5vi',
  marginRight: '1.5vi',
  p: 'auto',
  border: '1px solid #027368',
  boxShadow: '1px -4px 12px #3F528C',
  '& > p': {
  	margin: '5%',
    padding: '5%',
    fontSize: '2vi',
    fontWeight: 700,
    display: 'block',
  }
})) as typeof Paper;

export default function Dashboard(props: {
	user: User, 
	visible: boolean,
    fetch_userinfo: Function,
})
{
	const [visible, setVisible] = useState(props.visible);
	const [visProp, setVisProp] = useState('none');
  	const [nbTotalMatches, setTotalMatches] = useState(0);
  	const [victory, setVictory] = useState(0);
	const [scores, setScores] = useState([
		{
			id: 0, 
			winnerId: 0, 
			winnedAt: '', 
			scores: [], 
			players: []
		},
	]);
	const [challengers, setChallengers] = useState(new Map());
	
	const fetching = useRef(0);

	useEffect(() => setVisible((visState) => !visState), [props.visible]);
	useEffect(() => setVisProp((prop) => ((visible === true) ? 'flex' : 'none')), [visible]);

	const computeVictory = (scores: any) => {
		let cnt = 0;
    	scores.forEach((score: any) => {
    		if (score.winnedAt !== null)
    			++cnt;
    	});
    	setVictory(cnt);
	};

	const computeChallengers = (scores: any) => {
		scores.forEach( (game: any) => { 
			return (game.players.forEach( (player: any) => {
				if (player.id !== props.user.id && player.name !== props.user.name)
					setChallengers(challengers.set(player.name, (challengers.get(player.name) !== undefined ? challengers.get(player.name) + 1 : 1)));
			}))
		});
	};

  	useEffect(() => {
	    const refresh = () => {

	      if (fetching.current + 5000 > + new Date())
	        return ;
	      fetching.current = + new Date();

	      fetch(`http://${window.location.hostname}:8190/game/score`, fetch_opt())
	        .then(res => res.json())
	        .then(result => {

	        	(result[0].id === 0) ? setVisible(false) : setVisible(true)
	        	
	        	if (result[0].id !== nbTotalMatches)
	        	{
		        	setScores(result);
		        	setTotalMatches(result[0].id);    	

		        	computeVictory(result);
		        	computeChallengers(result);
	        	}

	        	console.log("result", result, "scores", scores, props.visible, props.user, props.user.friends);
	        })
	        .catch(() => {});

	        fetch(`http://${window.location.hostname}:8190/friend`, fetch_opt())
	        .then(res => res.json())
	        .then(result => {
	        	if (result)
	        	/*(result[0].id === 0) ? setVisible(false) : setVisible(true)
	        	
	        	if (result[0].id !== nbTotalMatches)
	        	{
		        	setScores(result);
		        	setTotalMatches(result[0].id);    	

		        	computeVictory(result);
		        	computeChallengers(result);
	        	}*/

	        	console.log("result", result);
	        })
	        .catch((e: any) => {console.log("error", e);});
	    };

	    const refreshInterval = setInterval(refresh, 5000);
	    refresh();

	    return () => {
	      clearInterval(refreshInterval);
	    }
  });

	return (
		<React.Fragment>
			<Box 
              component="div"
              sx={{ 
                width: { md: '70%'},
                minHeight: '100%',
                display: visProp, 
                flexFlow: 'column',
                flex: '2 1 auto',
                alignItems: {md: 'center'},
                border: '1px solid red',
              }}
            >
			<BoxPaper 
				sx={{
					marginTop: {
						xs: '9.5vi',
						md: 0
				}}}>
				
				<Box component='p'>
				Nombres de matches joués: <Box component='span'>{nbTotalMatches}</Box> Nombres de victoires: <Box component='span'>{victory}</Box>
				<Box component='span'>{challengers}</Box>
				</Box>
				<Box component='p'>
					Nullam eu sapien sagittis, molestie magna nec, aliquet dolor. Fusce gravida quis velit non aliquet. Nulla et lacinia magna. Vestibulum nec nunc eget nulla maximus condimentum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vestibulum dignissim nisi interdum neque accumsan, vitae laoreet turpis laoreet. Curabitur ut cursus mi, rhoncus euismod leo. Donec eu pellentesque libero. Fusce laoreet in augue eu condimentum. Aliquam volutpat nisi in scelerisque imperdiet. Sed justo ante, scelerisque at sollicitudin vel, varius ut dui. Fusce varius tortor quis posuere dignissim. Maecenas neque ligula, vulputate ac turpis nec, blandit mollis enim.
				</Box>
				<Box component='p'>
					Nulla id semper orci. Curabitur odio lacus, interdum condimentum volutpat ut, efficitur at quam. Fusce ut purus consectetur, porta urna a, semper tellus. Ut faucibus, magna volutpat scelerisque rutrum, lorem lectus vestibulum tellus, sed consequat leo magna ut mauris. Cras vestibulum ipsum ut iaculis mollis. Morbi ut efficitur lorem. Ut varius tristique erat, et consequat est finibus et. Vivamus a magna ut quam lacinia iaculis. Nullam sed fringilla sem, vitae varius metus.
				</Box>
				<Box component='p'>
					Praesent blandit diam at nunc posuere consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum auctor quam auctor ornare efficitur. Sed in faucibus orci. Nullam ornare, quam a blandit convallis, libero est tempor purus, ac rutrum dui sem a orci. Nulla facilisi. Aenean dolor ante, convallis sit amet ligula at, scelerisque pulvinar diam. Vestibulum porttitor eleifend nibh, ut accumsan purus commodo quis. In hac habitasse platea dictumst. Duis feugiat tristique viverra. In non massa ut diam pretium eleifend. Vivamus a erat sollicitudin arcu volutpat venenatis id et leo. Ut a nunc at dui efficitur condimentum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur tortor nisi, ornare dictum est at, facilisis fringilla sapien. Vestibulum consequat metus ut odio auctor, in dapibus est tincidunt.
				</Box>
				<Box component='p'>
					Nulla cursus nisi quis augue tincidunt volutpat. Nunc hendrerit porta lacus, quis dignissim lectus facilisis id. Sed iaculis, nibh eu imperdiet ultricies, lorem dolor rhoncus mauris, eu placerat tortor nibh quis sapien. Integer cursus, sapien vitae euismod semper, erat velit sodales tellus, vel efficitur massa turpis id nunc. Praesent pellentesque nibh a auctor pellentesque. Sed in lacus diam. Vivamus accumsan ultrices ipsum bibendum finibus. Integer varius pulvinar diam, et fermentum erat pulvinar eget. Quisque sagittis varius varius. Maecenas convallis dolor non quam efficitur posuere. Suspendisse lectus nibh, vehicula nec malesuada vitae, facilisis ac nisi. Maecenas auctor lorem sit amet blandit suscipit. Maecenas vehicula et turpis tempor lobortis. Maecenas vitae sagittis augue, ac venenatis nulla.
				</Box>
			</BoxPaper>
			</Box>
		</React.Fragment>
	);
}