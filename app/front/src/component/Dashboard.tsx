import React from 'react';
import { useState, useEffect, useRef, } from 'react';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
 } from "chart.js";
import { Doughnut, Bar } from 'react-chartjs-2';

import { User } from '../interface/User';

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
    display: 'flex',
  },
  '& > h3': {
    marginLeft: '2.5%',
    paddingLeft: '5%',
    fontSize: '2.5vi',
    fontWeight: 700,
    display: 'block',
  },
  '& > h4': {
    marginLeft: '3.5%',
    paddingLeft: '5%',
    fontSize: '2.25vi',
    fontWeight: 700,
    display: 'block',
  }
})) as typeof Paper;

export default function Dashboard(props: {
  user: User,
  visible: boolean,
})
{
  const [visible, setVisible] = useState(props.visible);
  const [visProp, setVisProp] = useState('none');
    const [nbTotalMatches, setTotalMatches] = useState(0);
    const [victory, setVictory] = useState(0);
    const [defeat, setDefeat] = useState(0);
  const [challengers, setChallengers] = useState([
    {
      challenger: '',
      challenges: 0
    },
  ]);

  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

  const [dataVictoryChart, setDataVChart] = useState({
    datasets: [
    {
      data: [0, 0],
      backgroundColor: ['#027368', '#3f528c'],
      borderWidth: 8,
      borderColor: 'rgba(0,0,0,0.4)',
    },
    ],
    labels: ['Victoires', 'Défaites'],
  });
  const [dataChallengers, setDataChallengers] = useState({
      datasets: [
        {
          backgroundColor: '#8493BF',
          barPercentage: 0.5,
          barThickness: 12,
          borderRadius: 4,
          categoryPercentage: 0.5,
          data: [] as Number[],
          label: 'Challengers',
          maxBarThickness: 10
        },
       ],
      labels: ['']

    });

  const options = {
    datasets: {},
    layout: {
      padding: 0,
    },
    responsive: true,
  };



  const fetching = useRef(0);

  useEffect(() => setVisible((visState) => !visState), [props.visible]);
  useEffect(() => setVisProp((prop) => ((visible === true) ? 'flex' : 'none')), [visible]);

  const computeVictory = (scores: any) => {
    let cnt = 0;
      scores.forEach((score: any) => {
        if (score.winnedAt !== null && score.winnerId !== null)
          ++cnt;
      });
      return cnt;
  };

  const computeDefeat = (scores: any) => {
    let cnt = 0;
    scores.forEach((score: any) => {
      if (score.winnedAt === null && score.winnerId !== null)
          ++cnt;
    });
      return cnt;
  };

  const computeChallengers = (scores: any) => {
    scores.forEach( (game: any) => {
      return (game.players.forEach( (player: any) => {
        if (player.id !== props.user.id && player.name !== props.user.name) {
          if (challengers[0].challenger.length > 0)
          {
            let found = false;
            challengers.forEach((item: any) => {
              if (item.challenger === player.name)
              {
                found = true;
                item.challenges++;
              }
            });
            if (!found)
              challengers.push({challenger: player.name, challenges: 1});
          }
          else {
            challengers.pop();
            challengers.push({challenger: player.name, challenges: 1});
          }
          setChallengers(challengers);
        }
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

          if ((result.length) !== nbTotalMatches)
          {
            setTotalMatches(result.length);
            setVictory(computeVictory(result));
            setDefeat(computeDefeat(result));
            computeChallengers(result);
            setDataVChart({
              datasets: [
                {
                  data: [computeVictory(result), computeDefeat(result), result.length - (computeVictory(result) + computeDefeat(result))],
                  backgroundColor: ['#027368', '#3f528c', '#8493BF'],
                  borderWidth: 8,
                  borderColor: 'rgba(0,0,0,0.4)',
                },
              ],
              labels: ['Victories', 'Defeats', 'Draws'],
            });
            const values_challengers = challengers.map((ch: any) => ch.challenges);
            const labels_challengers = challengers.map((ch: any) => ch.challenger);
            setDataChallengers({
              datasets: [
              {
                backgroundColor: '#027368',
                barPercentage: 0.75,
                barThickness: 50,
                borderRadius: 40,
                categoryPercentage: 0.77,
                data: values_challengers,
                label: 'Challengers',
                maxBarThickness: 120
              },
              ],
              labels: labels_challengers
            });
          }
        })
        .catch(() => {});
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
              }}
            >
      <BoxPaper
        sx={{
          marginTop: {xs: '9.5vi', md: 0},
          marginBottom: {xs: 0, md: '9.5vi',},
      }}>
        <Box component='h4'>My games</Box>

        <Box component='div' sx={{display: 'flex', flowDirection: 'column', justifyContent: 'space-around', alignItems: 'flex-end', textAlign: 'center',
    fontSize: '1.2vi',}}>
          <Box component='p' sx={{fontSize: '1.2vi', p: 0, m: 0,}}>Total games: <br/><Box component='span'>{nbTotalMatches}</Box></Box>

          <Box component='p' sx={{fontSize: '1.2vi', p: 0, m: 0,}}>Victories: <br/><Box component='span'>{victory}</Box></Box>
          <Box component='p' sx={{fontSize: '1.2vi', p: 0, m: 0,}}>Defeats: <br/><Box component='span'>{defeat}</Box></Box>
          <Box component='p' sx={{fontSize: '1.2vi', p: 0, m: 0,}}>Draws: <br/><Box component='span'>{nbTotalMatches - (victory + defeat)}</Box></Box>
        </Box>

        <Box component='div' sx={{ display: 'flex', flowDirection: 'row', justifyContent: 'center', marginTop: 0}}>

          <Box component='p' sx={{width: {xs: '75%', md:'50%'}, mr: '5%'}}>
            <Doughnut data={dataVictoryChart} options={options} />
          </Box>

        </Box>
      </BoxPaper>
      <BoxPaper
        sx={{
          marginTop: {xs: '9.5vi', md: 0},
          marginBottom: {xs: 0, md: '9.5vi',},
      }}>

        <Box component='h4'>My main challengers</Box>
        <Box component='p'>
          <Bar data={dataChallengers} options={options}/>
        </Box>

      </BoxPaper>
      </Box>
    </React.Fragment>
  );
}
