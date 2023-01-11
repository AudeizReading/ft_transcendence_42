import React, { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { QRCodeSVG } from 'qrcode.react';

import { fetch_opt } from '../dep/fetch'
import { User } from '../interface/User'

function Settings(props: {
    fetch_userinfo: Function,
    user: User
  }) {

  const twoFA = useRef(props.user.twoFA)

  const refTwoFA = React.createRef();

  useEffect(() => {
    if ((!!props.user.twoFA) != (!!twoFA.current))
      twoFA.current = props.user.twoFA;
  }, [props.user.twoFA])

  const doAction2FA = () => {
    fetch(`http://${window.location.hostname}:8190/auth/code2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(fetch_opt().headers),
      },
      body: JSON.stringify({ twoFA: twoFA.current, code: (refTwoFA.current as HTMLInputElement).value }),
    }).then(res => res.json())
      .then(
        (result) => {
          
        },
        (error) => {
          
        }
      )
  }

  return (
    <Box component="main" sx={{ height: '100%', background: 'white', color: 'black', textAlign: 'center' }}>
      <Box component="h2">2FA</Box>
      <Box component="p">
        Pour effectuer {twoFA.current ? "l'activation" : 'la désactivation'} de la double authentification validez le code.
      </Box>
      {twoFA.current
      ? <Box>
          <Box sx={{ my: 2 }}>
            <QRCodeSVG
              size={256}
              imageSettings={{
                src:'/res/istockphoto-1124563104-612x612.jpeg',
                excavate: true,
                height: 100,
                width: 100
              }}
              level="H"
              value={`otpauth://totp/iceberg?secret=${encodeURIComponent(twoFA.current)}`}
            />
          </Box>
          <Stack spacing={2} direction="row" justifyContent="center">
            <TextField id="outlined-basic" label="Code 2FA" inputRef={refTwoFA} variant="outlined" />
            <Button variant="contained" onClick={doAction2FA}>Activer</Button>
          </Stack>
        </Box>
      :
        <Box>
          <Stack spacing={2} direction="row" justifyContent="center">
            <TextField id="outlined-basic" label="Code 2FA" inputRef={refTwoFA} variant="outlined" />
            <Button variant="contained" onClick={doAction2FA}>Désactiver</Button>
          </Stack>
        </Box>
      }
    </Box>
  );
}
export default Settings;