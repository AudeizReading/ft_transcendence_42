import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
}

export default function LoadingButton(props: LoadingButtonProps)
{
  const disabled: boolean = !!props.loading;
  const newProps = {...props};

  // Need to use this newProps thing to remove the "loading" prop, because it
  // musn't be passed to the button
  if ("loading" in newProps) {
    delete newProps.loading;
  }

  let loadingIcon: JSX.Element | undefined;
  if (disabled) {
    loadingIcon = <CircularProgress color="info" size={16} sx={{ mr: 1, verticalAlign: 'middle', mt: '-2px' }}/>
  }

  return (
    <React.Fragment>
      <Button variant="contained"
        disabled={disabled}
        {...newProps}
      >
        {loadingIcon}{newProps.children}
      </Button>
    </React.Fragment>
  );
}
