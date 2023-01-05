import React, { useState, useRef, useEffect } from 'react';

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
  const [name, setName] = useState(props.name);
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
    lineHeight: 1,
  };

  async function quitEditing() {
    setNewName(newName.trim());
    if (newName.length === 0 || newName === name) {
      setNewName(name);
      setEditing(false);
      return;
    }
    const res = await fetch(`http://${window.location.hostname}:8190/user/change-name/${newName}`, fetch_opt());
    const updtName = await res.text();
    setNewName(updtName);
    setName(updtName);
    props.fetch_userinfo();
    // TODO: error handling
    setEditing(false);
  }

  const nameView = (
    <TextField
      spellCheck={false}
      multiline
      size="small"
      value={name}
      sx={{ ...viewNameStyle, textArea: {...textFieldFont} }}
      onClick={() => setEditing(true)}
    />
  );
  
  const editingView = (
    <TextField
      spellCheck={false}
      multiline
      size="small"
      value={newName}
      sx={{textArea: {...textFieldFont} }}
      onBlur={quitEditing}
      onChange={(e: any) => setNewName(e.target.value)}
      inputProps={{maxLength: 32}}
    />
  );

  return editing ? editingView : nameView;
}
