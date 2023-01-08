import React, { useState, useEffect, useCallback } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';

import { fetch_opt } from '../dep/fetch'
import { User } from '../interface/User'
import EditableName from '../component/EditableName';
import ProfileActionButtons from '../component/ProfileActionButtons';
import MatchHistory from '../component/MatchHistory';

// TODO: Get a "User not found" page instead of a blank thing
function Profile(props: {
    fetch_userinfo: Function,
    user: User
  }) {
  const { userid } = useParams();

  const emptyUser = () => ({
    id: 0,
    name: '',
    avatar: '',
    wins: 0,
    loses: 0,
    status: "offline",
  });

  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(emptyUser());

  const navigate = useNavigate();

  const fetch_user = useCallback((userid: number) => {
    fetch('http://' + window.location.hostname + ':8190/user/' + userid.toString(), fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setLoaded(true)
          setUser({
            id: result.id,
            name: result.name,
            avatar: result.avatar,
            wins: result.wins,
            loses: result.loses,
            status: result.status,
          })
        },
        (error) => {
          navigate('/not-foud');
        }
      )
  }, [navigate]);

  // Updates whenever profile changes, or every X seconds with the rest of the logged user's info
  useEffect(() => {
    fetch_user(Number(userid));
  }, [fetch_user, userid, props.user]);

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

  const isOwnProfile: boolean = user.id !== null && user.id === props.user.id;

  const getStatusColor = (status: string) => {
    if (status === "online")
      return "#44b700";
    else if (status === "playing")
      return "#1976d2";
    else
      return "#7f7f7f";
  }

  return (
    <Box component="main" sx={{ textAlign: 'center', py: 1, display: "flex", flexDirection: "column", background: "white" }}>

      <Box sx={{
        width: 250,
        minWidth: 250,
        height: 250,
        minHeight: 250,
        my: 1,
        mx: 'auto',
        display: 'flex',
        position: 'relative',
        '&:hover > .editIcon': {
          visibility: 'visible',
          opacity: 1
        },
        '& > .editIcon': {
          visibility: 'hidden',
          opacity: 0,
          transition: 'all 0.1s linear'
        } }}
      >
        <Avatar
          alt={user.name}
          src={user.avatar}
          sx={{ width: '100%', height: '100%', border: `5px solid ${getStatusColor(user.status)}` }}
        />
        {
          isOwnProfile &&
            <Fab
              className="editIcon"
              color="primary"
              component="label"
              sx={{ position: 'absolute', top: '190px', right: '10px' }}
            >
              <input hidden accept="image/*" type="file" onChange={handleCapture} />
              <EditIcon />
            </Fab>
        }
      </Box>

      <Box display="flex" alignItems="center"
        sx={{
          mx: 'auto',
        }}>
        <EditableName
          editable={isOwnProfile}
          name={user.name}
          fetch_userinfo={props.fetch_userinfo}
        />
      </Box>

      <Box display="flex" alignItems="center" sx={{mx: 'auto', my: 1.5}}>
        <ProfileActionButtons
          disabled={isOwnProfile}
          fetch_userinfo={props.fetch_userinfo}
          currentUserFriends={props.user.friends}
          profileUser={user}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          '& > :not(style)': {
            p: '15px',
            m: '5px',
            width: 64,
            height: 64,
          }
        }}
      >
        <Paper variant="outlined">
          <p style={{ fontSize: 12, color: 'light-grey', fontWeight: 500, margin: 3 }}>Victoires</p>
          <p style={{ fontSize: 20, lineHeight: '20px', fontWeight: 'bold', marginBottom: 0 }}>{user.wins}</p>
        </Paper>
        <Paper variant="outlined">
          <p style={{ fontSize: 12, color: 'light-grey', fontWeight: 500, margin: 3 }}>Défaites</p>
          <p style={{ fontSize: 20, lineHeight: '20px', fontWeight: 'bold', marginBottom: 0 }}>{user.loses}</p>
        </Paper>
        <Paper variant="outlined" sx={{p: 0, m: 0}}>
          <p style={{ fontSize: 12, color: 'light-grey', fontWeight: 500, margin: 0, top: 0, padding: 0 }}>Parties jouées</p>
          <p style={{ fontSize: 20, lineHeight: '20px', fontWeight: 'bold', marginBottom: 0, marginTop: '15%' }}>{user.wins + user.loses}</p>
        </Paper>
        <Paper variant="outlined">
          <p style={{ fontSize: 12, color: 'light-grey', fontWeight: 500, margin: 3 }}>Ratio V/D</p>
          <p style={{ fontSize: 20, lineHeight: '20px', fontWeight: 'bold', marginBottom: 0 }}>{((user.wins / (user.loses || 1))).toFixed(2)}</p>
        </Paper>
      </Box>

      <Box display="flex" alignItems="center"
        sx={{
          mx: 'auto',
          mt: 1,
          minHeight: 200,
          height: '100%',
          maxWidth: 800,
          width: '100%',
        }}
      >
        <MatchHistory userID={user.id} />
      </Box>

    </Box>
  );
}
export default Profile;
