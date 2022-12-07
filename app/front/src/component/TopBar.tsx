import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Stack from '@mui/material/Stack';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps, AlertColor } from '@mui/material/Alert';

import { fetch_opt } from '../dep/fetch'
import { handleOpenAuthPopup } from '../dep/handleOpenAuthPopup'

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

declare global {
  interface Window {
    wOpen:any;
  }
}

const drawerWidth = 240;
const pages = [
  {name: 'Jouer', url: '/play'},
  {name: 'Score', url: '/score'},
  {name: 'Chat', url: '/chat'}
];

interface NotifDataType {
  text: string;
  date: string;
  url?: string | null;
  read: boolean;
  type?: AlertColor;
}

interface ActionRedirContent {
  url: string;
  date: string;
  type: 'redir';
}

interface NotifContainerType {
  num: number;
  arr: Array<NotifDataType>
}

function TopBar(props: { 
    loaded: boolean,
    alreadyOpen: boolean,
    fetch_userinfo: Function,
    user: {
      id: number,
      name: string,
      connected: boolean,
      avatar: string,
      notifs: NotifContainerType,
      msgs: NotifContainerType,
      actions: {
        num: number;
        arr: Array<ActionRedirContent>
      },
    }
  }) {

  const [user, setUser] = useState({...props.user});

  /* UserMenu */
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);

  const handleOpenNotifMenu = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotif(event.currentTarget);
    if (user.notifs.num > 0 && !user.notifs.arr[0].read) {
      fetch('http://' + window.location.hostname + ':8190/notif/read_all/' + user.notifs.arr[0].date, fetch_opt());
      user.notifs.arr.forEach((notif) => notif.read = true);
    }
  };
  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };
  /* --- */

  /* UserMenu */
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  /* --- */

  /* mobileDrawer */
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  /* --- */

  const handleLogout = async () => {
    await fetch('http://' + window.location.hostname + ':8190/auth/logout', fetch_opt());
    props.fetch_userinfo();
    handleCloseUserMenu();
  };

  const handleCloseSnackbar = async () => {
    if (user.msgs.num <= 0)
      return ;
    await fetch('http://' + window.location.hostname + ':8190/notif/read_last_msg/' + user.msgs.arr[0]?.date, fetch_opt());
    props.fetch_userinfo(); // Modifier `user.msgs.num` n'est pas suffisant :/
  }

  const navigate = useNavigate();

  const wait_beforeaction: any = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.wOpen) { window.wOpen.close() }
    };
    const handleAuthSuccess = () => {
      if (window.wOpen) { window.wOpen.close(); }
      props.fetch_userinfo();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('auth_success', handleAuthSuccess);
    setUser(props.user);

    const doAction = async () => {
      if (props.loaded && !props.alreadyOpen && props.user.actions.num > 0 && !wait_beforeaction.current)
      {
        wait_beforeaction.current = true;
        if (props.user.actions.arr[0].type === 'redir')
          navigate(props.user.actions.arr[0].url);
        await fetch('http://' + window.location.hostname + ':8190/notif/done_last_action/' + props.user.actions.arr[0]?.date, fetch_opt());
        console.log('action done!');
        wait_beforeaction.current = false;
      }
    }
    doAction();

    // cleanup this component
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('auth_success', handleAuthSuccess);
    };
  }, [props, user, navigate]);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" gap={0.5}>
        <SportsSoccer sx={{ mt: "-3px" }} />
        <Typography variant="h6" sx={{ my: 2 }}>
          <Link to="/" component={RouterLink} color="inherit" underline="none">PONG</Link>
        </Typography>
      </Stack>
      <Divider />
      <List>
        {pages.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton component={RouterLink} to={item.url} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <SportsSoccer sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/" 
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PONG
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box component="nav">
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
          <SportsSoccer sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PONG
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={handleDrawerToggle}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={RouterLink}
                to={page.url}
              >
                {page.name}
              </Button>
            ))}
          </Box>


          { (user.connected && <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Ouvrir le menu des notifications">
              <IconButton
                onClick={handleOpenNotifMenu}
                size="large"
                aria-label="Afficher les notifications"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <Badge badgeContent={user.notifs.num ? user.notifs.arr.filter((obj) => obj.read === false).length : 0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              onClick={handleCloseNotifMenu}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  maxWidth: 350,
                  maxHeight: user.notifs.num ? '80%' : '102px',
                  mt: 1,
                  '&.MuiPaper-root': { height: '100%' },
                  '& .MuiMenuItem-root': { p: 0 },
                  '& .MuiMenu-list': {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'auto',
                    p: 0
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 19,
                    width: 10,
                    height: 10,
                    bgcolor: 'primary.main',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem key="header" disableGutters={true} disableRipple={true}
                sx={{
                  pointerEvents: 'none',
                  textAlign: 'center',
                  borderRadius: '4px 4px 0px 0px',
                  fontWeight: 700,
                  display: 'block',
                  fontSize: '1.4em',
                  lineHeight: '45px',
                  height: '45px',
                  px: 5,
                  color: 'white',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  }
                }}>
                Notifications
              </MenuItem>
              <MenuItem key="content" disableGutters={true} disableRipple={true}
                sx={{
                  overflow: 'auto',
                  '&:hover': {
                    bgcolor: 'inherit'
                  },
                }}>
              { user.notifs.num ?
                <List sx={{ height:'100%', p: 0, overflow: 'auto' }}>
                  {user.notifs.arr.map((notif, index) => (
                    Boolean(index) && <Divider /> , // eslint-disable-line
                    <ListItem key={index} onClick={handleCloseNotifMenu} sx={{ display: 'block', p: 0, m: 0 }}
                      {...(notif.url !== '' ? {
                          component: RouterLink,
                          to: notif.url
                        } : {})
                      }
                    >
                      <ListItemButton sx={{ display: 'block', pt: 1, pb:0 }}>
                        <Box sx={{ color: notif.read && false /* TODO: readAt ??? */ ? 'grey' : 'text.primary', display: 'block',
                                   fontWeight: 'medium', whiteSpace: 'normal' }}>
                          {notif.text}
                        </Box>
                        <Box sx={{ color: 'text.secondary', display: 'block', fontSize: 11, textAlign: 'right' }}>
                          {new Date(notif.date).toLocaleString()}
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List> 
              :
                <Box sx={{ color: 'text.primary', display: 'block', fontWeight: 'medium', whiteSpace: 'normal', px: 4, py: 2 }}>
                  Vous n'avez aucune notification !
                </Box>
              }
              </MenuItem>
              {/* <MenuItem key="bottom" disableGutters={true} disableRipple={true}
                sx={{
                  pointerEvents: 'none',
                  textAlign: 'center',
                  borderRadius: '0px 0px 4px 4px',
                  fontWeight: 700,
                  display: 'block',
                  fontSize: '1.4em',
                  lineHeight: '45px',
                  height: '45px',
                  px: 5,
                  color: 'white',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  }
                }}> </MenuItem> */}
            </Menu>

            <Tooltip title="Ouvrir le menu utilisateur">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user.name} src={user.avatar} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              id="account-menu"
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              onClick={handleCloseUserMenu}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem key="Profil" onClick={handleCloseUserMenu}
                component={RouterLink}
                to={'/user/' + user.id}
              >
                <Avatar alt={user.name} src={user.avatar} /> Profil
              </MenuItem>
              <Divider />
              <MenuItem key="Amis" onClick={handleCloseUserMenu}
                component={RouterLink}
                to={'/myfriends/'}
              >
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Amis
              </MenuItem>
              <MenuItem key="Options" onClick={handleCloseUserMenu}
                component={RouterLink}
                to={'/user/' + user.id}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Options
              </MenuItem>
              <MenuItem key="Deconnexion" onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>) ||
          <Button
            color="inherit"
            sx={{
              fontWeight: 700
            }}
            onClick={handleOpenAuthPopup} >Login</Button> }
        </Toolbar>
      </Container>
      <Snackbar
        open={user.msgs.num !== 0}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ top: '80px !important' }}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={user.msgs.arr[0]?.type||'info'} sx={{ width: '100%' }}>
          {user.msgs.arr[0]?.text}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
export default TopBar;