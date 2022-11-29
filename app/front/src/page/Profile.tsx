import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import { fetch_opt } from '../dep/fetch.js'

function Profile(props: { 
    fetch_userinfo: Function,
    user: {
      id: number
    }
  }) {
  const { userid } = useParams();

  const emptyUser = () => ({
    id: 0,
    name: '',
    avatar: ''
  });

  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(emptyUser());

  const navigate = useNavigate();

  const fetch_user = (userid: number) => {
    fetch('http://' + window.location.hostname + ':8190/user/' + userid.toString(), fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setLoaded(true)
          console.log('fetch', result);
          setUser({
            id: result.id,
            name: result.name,
            avatar: result.avatar
          })
        },
        (error) => {
          navigate('/not-foud');
        }
      )
  };

  useEffect(() => {
    fetch_user(Number(userid));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = ({ target }: any) => {
    var data = new FormData()
    data.append('file', target.files[0])

    fetch('http://' + window.location.hostname + ':8190/user/avatar-upload', {
      method: 'POST',
      headers: fetch_opt().headers,
      body: data
    })
      .then(res => res.json())
      .then(
        (result) => {
          if (result.error)
            return alert("Attention l'image n'est pas valide!"); // TODO: Use mui message element
          fetch_user(Number(userid));
          props.fetch_userinfo();
          if (result.upload)
            alert("Reussi!"); // TODO: Use mui message element
        },
        (error) => {
          console.log(error)
          alert("Attention l'image n'est pas valide! (Taille (<420ko)? Format ?)"); // TODO: Use mui message element
        }
      )
  };

  return (
    <Box>
    {loaded &&
      <Grid container>
        <Grid xs={12} item alignItems="center">
          <Box sx={{ width: 250, height: 250, my: 2, mx: 'auto', display: 'block', position: 'relative',
                '&:hover > .editIcon': {
                  visibility: 'visible',
                  opacity: 1
                },
                '& > .editIcon': {
                  visibility: 'hidden',
                  opacity: 0,
                  transition: 'all 0.1s linear'
                } }}>
            <Avatar
              alt={user.name}
              src={user.avatar}
              sx={{ width: '100%', height: '100%' }}
            />
            {user.id !== null && user.id === props.user.id && <Fab className="editIcon" color="secondary" aria-label="upload avatar" component="label"
                 sx={{ position: 'absolute', top: '190px', right: '10px' }}>
              <input hidden accept="image/*" type="file" onChange={handleCapture} />
              <EditIcon />
            </Fab>}
          </Box>
          <h1>{user.name}</h1>
        </Grid>
        <Grid xs={12} item alignItems="center">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              '& > :not(style)': {
                p: '15px',
                mx: '10px',
                width: 64,
                height: 64,
              }
            }}
          >
            <Paper variant="outlined">
              <p style={{ fontSize: 12, color: 'light-grey', fontWeight: 500, margin: 3 }}>Victoires</p>
              <p style={{ fontSize: 20, lineHeight: '20px', fontWeight: 'bold', marginBottom: 0 }}>6941</p>
            </Paper>
            <Paper variant="outlined">
              <p style={{ fontSize: 12, color: 'light-grey', fontWeight: 500, margin: 3 }}>Défaites</p>
              <p style={{ fontSize: 20, lineHeight: '20px', fontWeight: 'bold', marginBottom: 0 }}>12</p>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    }
    </Box>
  );
}
export default Profile;
