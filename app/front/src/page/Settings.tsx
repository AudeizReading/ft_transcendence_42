import React, { useState, useEffect } from 'react';
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

  const [doubleFA, setDoubleFA] = useState(props.user.doubleFA);
  const [error, setError] = useState(false);
  const [activated, setActivated] = useState(!props.user.doubleFA);

  const refDoubleFA = React.createRef();

  useEffect(() => {
    if ((!!props.user.doubleFA) !== (!!doubleFA)) {
      setDoubleFA(props.user.doubleFA);
      setActivated(!!props.user.doubleFA);
    }
  }, [props.user, doubleFA]);

  const doAction2FA = () => {
    fetch(`http://${window.location.hostname}:8190/auth/code2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(fetch_opt().headers),
      },
      body: JSON.stringify({ doubleFA: doubleFA, code: (refDoubleFA.current as HTMLInputElement).value }),
    }).then(res => res.json())
      .then(
        (result) => {
          setError(!result.success);
          if (result.success)
            props.fetch_userinfo();
        },
        (error) => {
          setError(true);
        }
      );
  }

  return (
    <Box component="main" sx={{ height: '100%', background: 'white', color: 'black', textAlign: 'center' }}>
      <Box component="h2">2FA</Box>
      <Box component="p">
        Pour effectuer {!activated ? "l'activation" : 'la désactivation'} de la double authentification validez le code.
      </Box>
      {!activated && doubleFA
       && <Box sx={{ my: 2 }}>
            <QRCodeSVG
              size={256}
              imageSettings={{
                src:'/res/istockphoto-1124563104-612x612.jpeg',
                excavate: true,
                height: 100,
                width: 100
              }}
              level="H"
              value={`otpauth://totp/iceberg?secret=${encodeURIComponent(doubleFA)}`}
            />
          </Box>}
      <Stack spacing={2} direction="row" justifyContent="center" sx={{ mb: '36px' }}>
        <TextField id="outlined-basic" inputRef={refDoubleFA} variant="outlined"
          label={error ? 'Error' : 'Code 2FA'} {...(error ? {error: true, helperText: 'Wrong 2FA code.'} : {})}
          sx={{ '.MuiFormHelperText-root': { position: 'absolute', bottom: '-24px' } }}/>
        <Button variant="contained" onClick={doAction2FA}>{!activated ? 'Activer' : 'Désactiver'}</Button>
      </Stack>
    </Box>
  );
}
export default Settings;
