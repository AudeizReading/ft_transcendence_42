import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
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
import MenuItem from '@mui/material/MenuItem';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

declare global {
  interface Window {
    wOpen:any;
  }
}

const hostname = window !== undefined && window.location.hostname;

const drawerWidth = 240;
const pages = [
  {name: 'Jouer', url: '/play'},
  {name: 'Score', url: '/score'},
  {name: 'Chat', url: '/chat'}
];

function TopBar() {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorElUser);

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
    
  const fetch_opt = () => ({
    'headers': { 'Authorization': localStorage['bearer'] ? 'Bearer ' + localStorage['bearer'] : '' }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState({
    avatar: ''
  });

  const fetch_userinfo = () => {
    fetch('http://' + hostname + ':8190/user/info', fetch_opt())
      .then(res => res.json())
      .then(
        (result) => {
          setIsConnected(result.connected == true);
          setUser(result.user)
        },
        (error) => {
          console.log(error)
          setIsConnected(false);
        }
      )
  };

  const handleLogout = (async () => {
    await fetch('http://' + hostname + ':8190/auth/logout', fetch_opt());
    fetch_userinfo();
    handleCloseUserMenu();
  });

  const handleOpenAuthPopup = () => {
    const href = "http://" + hostname + ":8190/auth/";

    try {
      if (window.wOpen) { window.wOpen.close(); }

      let pos = '';
      if (window)
      {
        pos += ',height=' + Math.max(window.innerHeight - 200, 650);
        pos += ',left=' + (window.screenX + 4);
        pos += ',top=' + (window.screenY + (window.outerHeight - window.innerHeight) + 74);
      }
      window.wOpen = window.open(href, '', 'width=490' + pos);
    } catch (e) {
      window.wOpen = window.open(href, '', 'width=490,height=700');
    }

    //if (!window.wOpen.closed) { return false; }
  }

  const handleBeforeUnload = () => {
    if (window.wOpen) { window.wOpen.close() }
  };

  const handleAuthSuccess = () => {
    if (window.wOpen) { window.wOpen.close(); }
    fetch_userinfo();
  }

  useEffect(() => {
    console.log('TopBar render');
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('auth_success', handleAuthSuccess);
    fetch_userinfo();
    const interval = setInterval(() => fetch_userinfo(), 15000); // TODO: Better? Socket.io?

    // cleanup this component
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('auth_success', handleAuthSuccess);
    };
  }, []);

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


          { (isConnected && <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Me" src={user.avatar} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              id="account-menu"
              open={open}
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
                to="/profile"
              >
                <Avatar src={user.avatar} /> Profil
              </MenuItem>
              <Divider />
              <MenuItem key="Amis" onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Amis
              </MenuItem>
              <MenuItem key="Options" onClick={handleCloseUserMenu}>
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
    </AppBar>
  );
}
export default TopBar;