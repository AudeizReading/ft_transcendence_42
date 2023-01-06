import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { Link as RouterLink } from 'react-router-dom';

// Component to render the avatar and name of the user, with an online indicator badge.
// The whole thing is clickable as a button.
// Setting the noBadge prop or giving an undefined status disables the status badge on the avatar
export default function UserButton(props: {
    id: number,
    name: string,
    avatar: string,
    status?: "offline" | "online" | "playing" | undefined,
    noBadge?: boolean,
  })
{
  if (!props.status || props.noBadge) {
    return (
      <ButtonBase href={`http://${window.location.hostname}:3000/user/${props.id}`}>
        <Avatar alt={props.name} src={props.avatar}>{props.name[0]}</Avatar>
        <Box sx={{pl: 1}}>
          {props.name}
        </Box>
      </ButtonBase>
    );
  }

  const AvatarBadge = getBadge(props.status);
  return (
    <ButtonBase component={RouterLink} to={`/user/${props.id}`} >
      <AvatarBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        <Avatar alt={props.name} src={props.avatar}>{props.name[0]}</Avatar>
      </AvatarBadge>
      <Box sx={{pl: 1}}>
        {props.name}
      </Box>
    </ButtonBase>
  );
}

function getBadge(status: "offline" | "online" | "playing" | undefined)
{
  const GreenBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
  }));

  const BlueBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#1976d2',
      color: '#1976d2',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
  }));

  const GreyBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#7f7f7f',
      color: '#7f7f7f',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    }
  }));

  if (status === "playing")
    return BlueBadge;
  else if (status === "online")
    return GreenBadge;
  else
    return GreyBadge;
}
