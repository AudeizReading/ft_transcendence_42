import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { User } from '../interface/User';

function UserChip(props: User)
{
  const {name, avatar} = props;
  const avatarComponent = <Avatar alt={name} src={avatar}>{name[0]}</Avatar>;

  const chip = (
    <Chip
      avatar={avatarComponent}
      label={props.name}
      variant="outlined"
      component="a"
      href={`http://${window.location.hostname}:3000/user/${name}`}
      clickable
      />
  );

  return chip;
}

export default UserChip;
