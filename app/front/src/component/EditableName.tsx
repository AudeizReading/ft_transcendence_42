import React, { useState } from 'react';

import { TextField, Box, useTheme, Typography } from '@mui/material';
import { fetch_opt } from '../dep/fetch';

interface EditableNameProps {
  editable: boolean,
  name: string,
  fetch_userinfo: Function
}

export default function EditableName(props: EditableNameProps)
{
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(props.name);
  const theme = useTheme();
  
  const viewNameStyle = {
    fieldset: {
      border: "none",
    },
    "&:hover fieldset": props.editable ? { // Only apply this style if is editable
      border: "1px solid",
      borderColor: theme.palette.primary.main + "!important",
    } : {},
  };
  
  const textFieldFont = {
    textAlign: "center",
    fontSize: "2em",
    fontWeight: "bold",
  };

  async function quitEditing() {
    const res = await fetch(`http://${window.location.hostname}:8190/user/change-name/${newName}`, fetch_opt());
    const updtName = await res.text();
    console.log(updtName);
    setNewName(updtName);
    props.fetch_userinfo();
    // TODO: error handling
    setEditing(false);
  }

  const nameView = (
    <TextField
      size="small"
      value={newName}
      sx={{ ...viewNameStyle, input: {...textFieldFont} }}
      onClick={() => setEditing(true)}
    />
  );
  
  const editingView = (
    <TextField
      size="small"
      value={newName}
      sx={{input: {...textFieldFont} }}
      onBlur={quitEditing}
      onChange={(e: any) => setNewName(e.target.value)}
    />
  );

  return editing ? editingView : nameView;
}
