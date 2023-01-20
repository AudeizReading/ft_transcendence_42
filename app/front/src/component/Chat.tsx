import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, FormControlLabel, Grid, IconButton, InputLabel, ListItemAvatar, ListItemText, Menu, MenuItem, Paper, Select, TextField } from '@mui/material';
import ChatIcon from '@mui/icons-material/ChatBubble';
import AddIcon from '@mui/icons-material/Add';
import { fetch_opt } from '../dep/fetch'
import socketIOClient, { Socket } from "socket.io-client";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { render } from '@testing-library/react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

interface ChatUser {
	id: number;
	name: string;
	power: string;
	avatar: string;
	muted?: Date;
	banned?: Date;
}

interface ChatMessage {
	sender_name: string;
	content: string;
	time: Date;
}

interface ChatChannel {
	id: number;
	name: string;
	visibility: string;
	users: ChatUser[];
	messages: ChatMessage[];
	notif?: boolean;
	fetched?: boolean;
	last_message?: Date;
}

interface ChannelTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  channel: ChatChannel;
  sendMessage: any;
  current_user: ChatUser;
}

interface AddableUser {id: number;name: string;avatar: string;}

//TODO: FIX BUG LE TEMPS NE CHANGE PAS
function MuteBanTimeDialog(props: {children?: React.ReactNode, functionCallback: any, closeCallback: any, open: boolean, text: string, user_id: number, expo: Date}) {
	const { children, functionCallback, closeCallback, open, text, user_id, expo, ...other} = props;
	
	const [expiration, setExpiration] = React.useState<Dayjs | null>(dayjs(expo))

	const handleClickOpen = () => {
	  closeCallback(true);
	};
  
	const handleClose = () => {
	  closeCallback(false);
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
		<Dialog open={open} onClose={handleClose}>
        <DialogTitle>Mute/ban</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select when it will expire
          </DialogContentText>
		  <DateTimePicker
			label="Expiration"
			value={expiration}
			onChange={(e: any) => {
				setExpiration(expiration);
			}}
			renderInput={(params: any) => <TextField {...params} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={(e) => functionCallback(text, user_id, expiration?.toDate())}>{text}</Button>
        </DialogActions>
      </Dialog>
	  </LocalizationProvider>
	)
}

function ChannelSettingsDialog(props: {children?: React.ReactNode, functionCallback: any, closeCallback: any, open: boolean, channel: ChatChannel, owner: boolean}) {
	const { children, functionCallback, closeCallback, open, channel, owner, ...other} = props;
	
	const [usePassword, setUsePassword] = React.useState<boolean>(channel.visibility == "PASSWORD_PROTECTED")	
	const [password, setPassword] = React.useState<string>("");
	const [selectedUser, setSelectedUser] = React.useState<number>(-1)
	const [addableUsers, setAddableUsers] = React.useState<AddableUser[]>([]);

	const handleClickOpen = () => {
	  closeCallback(true);
	};
  
	const handleClose = () => {
	  closeCallback(false);
	};

	React.useEffect(() => {
		const fetchData = async () => {
			const addableUsers = await fetch('http://' + window.location.hostname + ':8190/chat/channel/' + channel.id + '/addable_users', fetch_opt())
			setAddableUsers(await addableUsers.json() as AddableUser[])
		};
		fetchData()
	}, [])

	//console.log(channel)
	//console.log(owner)

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
		<Dialog open={open} onClose={handleClose}>
		<form onSubmit={(e) => {
			e.preventDefault();
			functionCallback(usePassword, password, selectedUser, channel);
		}}>
        <DialogTitle>Channel settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Channel settings
          </DialogContentText>
		  {owner && <FormControlLabel control={<Checkbox
			checked={usePassword}
			onChange={(e) => {
				setUsePassword(e.target.checked)
				if (!e.target.checked)
					setPassword("");
			}}
			inputProps={{ 'aria-label': 'Enable password' }}
		  />} label="Use password" />}
		  {owner && usePassword && <TextField
			id="password"
			name="password"
			value={password}
			onChange={(e) => setPassword(e.target.value)}
			label="Password"
			variant="standard"
			type="password"
			required={channel.visibility === "PUBLIC"}
		/>}
			<InputLabel id="users-label">Additional users</InputLabel>
			<Select
				fullWidth
				labelId="users-label"
				id="users-select"
				value={selectedUser}
				label="Visibility"
				onChange={(e) => setSelectedUser(e.target.value as number)}
			>
				{addableUsers.map((user) => {
					return (<MenuItem value={user.id}>
								<ListItemAvatar>
									<Avatar alt={user.name} src={user.avatar} />
								</ListItemAvatar>
								<ListItemText>{user.name}</ListItemText>
							</MenuItem>)
					})
				}
			</Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Modify</Button>
        </DialogActions>
		</form>
      </Dialog>
	  </LocalizationProvider>
	)
}

function ChannelTabPanel(props: ChannelTabPanelProps) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

  	const { children, value, index, channel, sendMessage, current_user, ...other} = props;

  	const [message, setMessage] = React.useState("");
	const [prompt, setPrompt] = React.useState<{callback: any, text: string, user_id: number}>({callback: null, text: "", user_id: -1});
	const [user, setUser] = React.useState<ChatUser>({id: -1, name:"", power:"", avatar:""});

	const [displayTimeModal, setDisplayTimeModal] = React.useState(false);

  	const inputRef = React.useRef<HTMLInputElement>(null);

	const applyBanOrMute = async (operation: string, user_id: number, expiration: Date) => {
		const op = operation === "MUTE" ? "MUTE_USER" : "BAN_USER";
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/`+channel.id, {
			method: 'PUT',
			headers: {
			'Content-Type': 'application/json',
			...(fetch_opt().headers)
			},
			body: JSON.stringify({operation: op, parameter: user_id, parameter_2: expiration})
		});
		console.log(result)
		setDisplayTimeModal(false);
	}

	const handlePrivateMessage = async (e: any) => {
		e.preventDefault()
		const user = channel.users.filter((u) => u.id == e.currentTarget.value)[0];
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/new`, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers),
			},
			body: JSON.stringify({name: "<DM>", password: null, users: [user.id], visibility: "PRIVATE_MESSAGE"}),
		});
		setAnchorEl(null);	
	}
	const handleBlock = async (e: any) => {
		e.preventDefault()
		const user = channel.users.filter((u) => u.id == e.currentTarget.value)[0];
		const result = await fetch(`http://${window.location.hostname}:8190/user/block/`+user.id, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers),
			},
		});
		setAnchorEl(null);
	}
	const handlePromote = async (e: any) => {
		e.preventDefault()
		const user = channel.users.filter((u) => u.id == e.currentTarget.value)[0];
		console.log(user, channel)
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/`+channel.id, {
			method: 'PUT',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers)
			},
			body: JSON.stringify({operation: user.power === "REGULAR" ? "ADD_ADMIN": "REMOVE_ADMIN", parameter: user.id})
		});
		setAnchorEl(null);
	}
	const handleMute = async (e: any) => {
		e.preventDefault()
		const user = channel.users.filter((u) => u.id == e.currentTarget.value)[0];
		console.log(user, channel)
		if (!user.muted)
		{
			setDisplayTimeModal(true);
			setPrompt({callback: applyBanOrMute, text: "MUTE", user_id: user.id});
		}
		else
		{
			const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/`+channel.id, {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json',
				...(fetch_opt().headers)
				},
				body: JSON.stringify({operation: "REVOKE_MUTE", parameter: user.id})
			});
		}
		setAnchorEl(null);
	}
	const handleBan = async (e: any) => {
		e.preventDefault()
		const user = channel.users.filter((u) => u.id == e.currentTarget.value)[0];
		if (!user.banned)
		{
			setDisplayTimeModal(true);
			setPrompt({callback: applyBanOrMute, text: "BAN", user_id: user.id});
		}
		else
		{
			const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/`+channel.id, {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json',
				...(fetch_opt().headers),
				},
				body: JSON.stringify({operation: "REVOKE_BAN", parameter: user.id}),
			});
		}
		setAnchorEl(null);
	}


	const handleClickOnUser = (e: any) => {
		e.preventDefault()
		setAnchorEl(e.currentTarget);
		setUser(channel.users.filter((u) => u.id == e.currentTarget.id as number)[0])
	};
	
	const handleClose = () => {
		setAnchorEl(null);
	};

  const msgList = channel.messages.map((message, index) => (
		<Grid key={index} item>
			<Typography>
				{message.time.toTimeString().split(' ')[0]} {message.sender_name}: {message.content}
			</Typography>
		</Grid>
	));

  //TODO: Blocking
  const channel_users = channel.users.map((user, idx) => {
	  	if (!user.banned || current_user.power !== "REGULAR")
		{
			return (
				<div key={idx}>
					<MuteBanTimeDialog functionCallback={prompt.callback} closeCallback={(e: any) => setDisplayTimeModal(false)} open={displayTimeModal} 
					text={prompt.text} user_id={prompt.user_id} expo={new Date()}/>
					<Grid item>
						<div id={String(user.id)}
							onClick={user.id == current_user.id ? undefined : handleClickOnUser}
						>
							<Avatar alt={user.name} src={user.avatar} />
							<Typography sx={user.banned && {textDecoration: "line-through"}}>{user.name}</Typography>
						</div>
					</Grid>
				</div>
			)
		}
		return (<></>)
  })

  const send_message = async () => {
	sendMessage(message, channel.id)
	inputRef.current!.focus()
	setMessage("")
  }

  const channel_chat_interface = (
	  <div>
		<Grid container direction="column" sx={{height: "90%"}}>
			{msgList}
		</Grid>
		<div>
			<Grid item xs={9} sm={6}>
			<TextField
				required
				inputRef={inputRef}
				id="message"
				name="message"
				label="Message"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				fullWidth
				variant="standard"
			/>
			</Grid>
			<Grid item xs={9} sm={2}>
				<Button
					type="submit"
					fullWidth
					variant="contained"
					onClick={(e) => send_message()}>
					Send
				</Button>
			</Grid>
		</div>
	  </div>
  )

  return (
	<div
	  role="tabpanel"
	  hidden={value !== index}
	  id={`vertical-tabpanel-${index}`}
	  aria-labelledby={`vertical-tab-${index}`}
	  {...other}
	>
	  {value === index && (
		<Grid container spacing={3} >
			<Grid container item xs={9} direction="column" >
				{channel_chat_interface}
			</Grid>
			<Grid container item xs={3} direction="column" >
				{channel_users}
				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
					'aria-labelledby': 'basic-button',
					}}
					>
						<MenuItem onClick={handlePrivateMessage} value={user.id}>DM</MenuItem>
						<MenuItem onClick={handleBlock} value={user.id}>Block</MenuItem>
						{current_user.power === "OWNER" && <MenuItem onClick={handlePromote} value={user.id}>{user.power === "ADMINISTRATOR" ? "Demote" : "Promote"}</MenuItem>}
						{current_user.power !== "REGULAR" && (current_user.power !== "OWNER" ? user.power === "REGULAR" : true) && <MenuItem onClick={handleMute} value={user.id}>{user.muted ? "Unmute" : "Mute"}</MenuItem>}
						{current_user.power !== "REGULAR" && (current_user.power !== "OWNER" ? user.power === "REGULAR" : true) &&  <MenuItem onClick={handleBan} value={user.id}>{user.banned ? "Unban" : "Ban"}</MenuItem>}
				</Menu>
			</Grid>
		</Grid>
	  )}
	</div>
  );
}

interface NewChannelTabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}  
function NewChannelTabPanel(props: NewChannelTabPanelProps) {
	const { children, value, index, ...other} = props;
  
	const [selectedMenu, setSelectedMenu] = React.useState<string>("NONE");
	const [visibility, setVisibility] = React.useState('PUBLIC')
	const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]) // array of user ids
	const [inputs, setInputs] = React.useState({
		name: "",
		password: ""
	})
	const [selectedChannel, setSelectedChannel] = React.useState<number>(-1);
	const [joinableChannels, setJoinableChannels] = React.useState<ChatChannel[]>([]);

	const [addableUsers, setAddableUsers] = React.useState<AddableUser[]>([]);
	const [status, setStatus] = React.useState("good")

	const inputRef = React.useRef<HTMLInputElement>(null);
	const passwordRef = React.useRef<HTMLInputElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputs((prevState) => ({
			...prevState,
			[e.target.name]: e.target.value,
		}));
	}

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/new`, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers),
			},
			body: JSON.stringify({name: inputs.name, password: inputs.password === "" ? null : inputs.password, users: selectedUsers, visibility: inputs.password !== "" && visibility === "PUBLIC" ? "PASSWORD_PROTECTED" : visibility}),
		});
		if (!result.ok)
		{
			inputRef.current!.focus()
			setStatus("error")
		}
		else
		{
			setInputs((prevState) => ({
				...prevState,
				password: ""
			}));
			setStatus("good");
			setSelectedMenu("NONE");
		}
	}

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/${selectedChannel}/join`, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers),
			},
			body: JSON.stringify({password: inputs.password === "" ? null : inputs.password})
		});
		if (!result.ok)
		{
			passwordRef.current!.focus()
			setStatus("error")
		}
		else
		{
			setInputs((prevState) => ({
				...prevState,
				password: ""
			}));
			setStatus("good");
			setSelectedMenu("NONE");
		}
	}


	React.useEffect(() => {
		const fetchData = async () => {
			const addableUsers = await fetch('http://' + window.location.hostname + ':8190/chat/channel/-1/addable_users', fetch_opt())
			setAddableUsers(await addableUsers.json() as AddableUser[])

			const joinable_channels = await fetch('http://' + window.location.hostname + ':8190/chat/all_joinable', fetch_opt())
			setJoinableChannels(await joinable_channels.json() as ChatChannel[])
			//console.log(addableUsers)
		};
		fetchData()
	}, [])

	//console.log(selectedUsers)
	let menu : JSX.Element
	
	menu = (
		<Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						onClick={(e) => setSelectedMenu("CREATE")}
						>
						CREATE
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						onClick={(e) => setSelectedMenu("JOIN")}
						>
						JOIN
					</Button>
				</Grid>
			</Grid>
		</Paper>
	)
	if (selectedMenu === "CREATE")
	{
		menu = (
			<Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
				<IconButton color="primary" aria-label="return" onClick={(e) => setSelectedMenu("NONE")}>
					<ArrowBackIosIcon />
				</IconButton>
				<Typography component="h1" variant="h4" align="center">
					New Channel
				</Typography>
				<React.Fragment>
					<form onSubmit={handleCreate}>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<TextField
								required
								id="name"
								name="name"
								error={status === "error"}
								value={inputs.name}
								onChange={handleChange}
								label={status !== "error" ? "Channel name" : "Already in use"}
								variant="standard"
								inputRef={inputRef}
							/>
						</Grid>
						<Grid item xs={12}>
							<InputLabel id="visibility-label">Visibility</InputLabel>
							<Select
								labelId="visibility-label"
								id="visibility-select"
								value={visibility}
								label="Visibility"
								onChange={(e) => setVisibility(e.target.value)}
							>
								<MenuItem value={"PUBLIC"}>PUBLIC</MenuItem>
								<MenuItem value={"PRIVATE"}>PRIVATE</MenuItem>
							</Select>
						</Grid>
						{visibility === "PUBLIC" && 
						<Grid item xs={12}>
							<TextField
								id="password"
								name="password"
								value={inputs.password}
								onChange={handleChange}
								label="Password (empty: none)"
								variant="standard"
								type="password"
							/>
						</Grid>
						}
						<Grid item xs={12}>
							<InputLabel id="users-label">Users</InputLabel>
							<Select
								multiple
								required
								fullWidth
								labelId="users-label"
								id="users-select"
								value={selectedUsers}
								label="Visibility"
								onChange={(e) => setSelectedUsers(e.target.value as number[])}
							>
								{addableUsers.map((user, i) => (
										<MenuItem key={i} value={user.id}>
											<ListItemAvatar>
												<Avatar alt={user.name} src={user.avatar} />
											</ListItemAvatar>
											<ListItemText>{user.name}</ListItemText>
										</MenuItem>
									))
								}
							</Select>
						</Grid>
						<Grid item xs={12}>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								>
								CREATE
							</Button>
						</Grid>
					</Grid>
					</form>
				</React.Fragment>
			</Paper>
		)
	}
	else if (selectedMenu === "JOIN")
	{
		menu = (<Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
		<IconButton color="primary" aria-label="return" onClick={(e) => setSelectedMenu("NONE")}>
			<ArrowBackIosIcon />
		</IconButton>
		<Typography component="h1" variant="h4" align="center">
			Join Channel
		</Typography>
		<form onSubmit={handleJoin}>
		<React.Fragment>
			<Grid container spacing={3}>
				<Grid item xs={12}>
					<InputLabel id="channels-label">Channel</InputLabel>
					<Select
						required
						fullWidth
						labelId="channels-label"
						id="channels-select"
						value={selectedChannel}
						label="Visibility"
						onChange={(e) => setSelectedChannel(e.target.value as number)}
					>
						{joinableChannels.map((channel) => {
							return (<MenuItem value={channel.id}>
										<ListItemText>{channel.name}</ListItemText>
									</MenuItem>)
							})
						}
					</Select>
				</Grid>
				{selectedChannel !== -1 && joinableChannels.filter((c) => c.id === selectedChannel)[0].visibility === "PASSWORD_PROTECTED" && 
				<Grid item xs={12}>
					<TextField
						id="password"
						name="password"
						value={inputs.password}
						onChange={handleChange}
						variant="standard"
						type="password"
						error={status === "error"}
						label={status !== "error" ? "Password" : "Wrong password"}
						inputRef={passwordRef}

					/>
				</Grid>
				}
				<Grid item xs={12}>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						>
						JOIN
					</Button>
				</Grid>
			</Grid>
		</React.Fragment>
		</form>
	</Paper>)

	}

	return (
	  <div
		role="tabpanel"
		hidden={value !== index}
		id={`vertical-tabpanel-${index}`}
		aria-labelledby={`vertical-tab-${index}`}
		{...other}
	  >
	   {value === index && menu}
	  </div>
	);
}  

function a11yProps(index: number) {
  return {
	id: `vertical-tab-${index}`,
	'aria-controls': `vertical-tabpanel-${index}`,
  };
}

class ChatComponent extends React.Component<{user_id: number}, {show: boolean, channels: ChatChannel[], current_channel_idx: number, current_channel_id: number, user_id: number, anchorEl: null | HTMLElement, displaySettingsDialog: boolean}> {
	
	constructor(props: any)
	{
		super(props);
		this.state = {show: false, channels: [], current_channel_idx: 0, current_channel_id: -1, user_id: props.user_id, anchorEl: null, displaySettingsDialog: false};
	}

	recvMsgHandler(data: any)
	{
		const channels : ChatChannel[] = this.state.channels
		this.setState({channels: channels.map((e) => {
			if (e.id == data.channelId)
			{
				const messages : ChatMessage[] = [
					...e.messages,
					{sender_name: e.users.filter((u) => u.id === data.senderId)[0].name, content: data.content, time: new Date(data.sent_at)}
				]
				return ({...e, notif: true, last_message: new Date(data.sent_at), messages: messages})
			}
			return (e);
		})})
	}

	channel_user_replace(user: number, channel: number, data: any)
	{
		let channels = this.state.channels
		channels.forEach((e, chan_idx) => {
			if (e.id === channel)
			{
				e.users.forEach((u, user_idx) => {
					if (u.id === user)
						channels[chan_idx].users[user_idx] = {...u, ...data}
				})
			}
		})
		this.setState({channels: channels})
	}

	async channelAddHandler(data: any)
	{
		console.log("Received add handler")

		// We got added to a new channel
		if (data.user == this.state.user_id)
		{
			console.log("we were added to a new channel")
			const res = await fetch('http://' + window.location.hostname + ':8190/chat/channel/'+data.channel, fetch_opt())
			if (res.ok)
			{
				const e = await res.json();
				const chan = {id: e.id, name: e.name, visibility: e.visibility, users: e.users.map((user: any) => ({id: user.user.id, name: user.user.name, avatar: user.user.avatar, power: user.power, banned: user.ban_expiration, muted: user.mute_expiration})),
					messages: e.messages.map((m: any) => ({sender_name: m.sender.user.name, content: m.content, time: new Date(m.sent_at)})),
					notif: false, fetched: true, last_message: new Date()
				}
				const c = this.state.channels
				this.setState({channels: [...c, chan]})
			}
		}
		// A user got added to a channel where i am
		else
		{
			console.log("a user was added to a channel we are in, refetch everything lol")
			const res = await fetch('http://' + window.location.hostname + ':8190/chat/channel/'+data.channel, fetch_opt())
			if (res.ok)
			{
				const e = await res.json();
				const chan = {id: e.id, name: e.name, visibility: e.visibility, users: e.users.map((user: any) => ({id: user.user.id, name: user.user.name, avatar: user.user.avatar, power: user.power, banned: user.ban_expiration, muted: user.mute_expiration})),
					messages: e.messages.map((m: any) => ({sender_name: m.sender.user.name, content: m.content, time: new Date(m.sent_at)})),
					notif: false, fetched: true, last_message: new Date()
				}
				const c = this.state.channels
				this.setState({channels: [...c.filter((e) => e.id !== data.channel), chan]})
			}
		}
		console.log(data)
	}

	async channelRemoveHandler(data: any)
	{
		console.log("Received remove handler")

		if (data.user == this.state.user_id)
		{
			console.log("we have to be removed from a channel")
			const c = this.state.channels
			this.setState({channels: c.filter((g) => g.id !== data.channel)})
		}
		else
		{
			const c = this.state.channels
			this.setState({channels: c.map((g) => {
				if (g.id === data.channel)
					return ({...g, users: g.users.filter((u) => u.id !== data.user)})
				return (g)
			})})
		}
	}
	channelMuteHandler(data: any)
	{
		console.log("On channel mute")
		this.channel_user_replace(data.user, data.channel, {muted: data.mute_expiration})
	}
	channelUnmuteHandler(data: any)
	{
		console.log("On channel Demute")
		this.channel_user_replace(data.user, data.channel, {muted: null})
	}
	channelPromoteHandler(data: any)
	{
		console.log("On channel promote")
		this.channel_user_replace(data.user, data.channel, {power: "ADMINISTRATOR"})
	}
	channelDemoteHandler(data: any)
	{
		this.channel_user_replace(data.user, data.channel, {power: "REGULAR"})
	}
	channelBanHandler(data: any)
	{
		console.log("Received ban handler")

		if (data.user == this.state.user_id)
			this.channelRemoveHandler(data)
		else
			this.channel_user_replace(data.user, data.channel, {banned: data.ban_expiration})
	}
	channelUnbanHandler(data: any)
	{
		console.log("Received unban handler")


		if (data.user == this.state.user_id)
			this.channelAddHandler(data)
		this.channel_user_replace(data.user, data.channel, {banned: null})
	}

	async componentDidMount()
	{
		let socket: Socket;
		if ((window as any).chatSocket)
			(window as any).chatSocket.disconnect();
		socket = socketIOClient('ws://' + window.location.hostname + ':8192/chat', {extraHeaders: fetch_opt().headers});
		(window as any).chatSocket = socket;

		socket.on('recv_msg', (data: any) => this.recvMsgHandler(data));
		socket.on('channel_add', (data: any) => this.channelAddHandler(data));
		socket.on('channel_remove', (data: any) => this.channelRemoveHandler(data));
		socket.on('channel_mute', (data: any) => this.channelMuteHandler(data));
		socket.on('channel_unmute', (data: any) => this.channelUnmuteHandler(data));
		socket.on('channel_promote', (data: any) => this.channelPromoteHandler(data));
		socket.on('channel_demote', (data: any) => this.channelDemoteHandler(data));
		socket.on('channel_ban', (data: any) => this.channelBanHandler(data));
		socket.on('channel_unban', (data: any) => this.channelUnbanHandler(data));

		const data = await fetch('http://' + window.location.hostname + ':8190/chat', fetch_opt())
		if (data.ok)
		{
			// Flatten the data so it can be directly applied to the state
			const json = await data.json();
			this.setState({channels: json.map((e: any) => {
				return ({
					id: e.id,
					name: e.name,
					visibility: e.visibility,
					users: e.users.map((user: any) => ({id: user.user.id, name: user.user.name, avatar: user.user.avatar, power: user.power, banned: user.ban_expiration, muted: user.mute_expiration})),
					messages: e.messages.map((m: any) => ({sender_name: m.sender.user.name, content: m.content, time: new Date(m.sent_at)})),
					notif: false,
					fetched: true,
					last_message: e.messages.length ? new Date(e.messages[0].sent_at) : new Date()
				})
			})})
		}
	}

	sendMessage = (content: string, channel_id: number) => {
		(window as any).chatSocket.emit("send_message", {content: content, channel: channel_id})
	}

	changeChannel = (e: React.ChangeEvent<{}>, new_value: number) =>
	{
		this.setState({current_channel_idx: new_value});
	}

	toggleDiv = () =>
	{
		const { show } = this.state
		this.setState({show: !show})
	}

	channelContextMenu = (e: any) => {
		e.preventDefault()
		this.setState({anchorEl: e.currentTarget})
		this.setState({current_channel_id: e.currentTarget.dataset.channelId as number})
	}

	handleSettingsDialog = (e: any) => {
		this.setState({displaySettingsDialog: true, anchorEl: null});
	}
	handleLeaveChannel = async (e: any) => {
		e.preventDefault()
		console.log(e.currentTarget.value)
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/`+e.currentTarget.value+'/leave', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers),
			},
		});
		if (result.ok)
			this.setState({anchorEl: null, current_channel_id: -1});
	}
	handleDeleteChannel = async (e: any) => {
		e.preventDefault()

	}


	generateTabLabels() : JSX.Element[]
	{
		let labels = this.state.channels.map((channel, index) => {
			let name: string = channel.name;
			if (channel.visibility === "PRIVATE_MESSAGE")
				name = "PM: " + channel.users[0].name + " - " + channel.users[1].name;
			const label = name + " (" + channel.users.length + ")"
			return (<Tab key={index} data-channel-id={String(channel.id)} onContextMenu={channel.visibility !== "PRIVATE_MESSAGE" ? this.channelContextMenu : undefined} label={label} {...a11yProps(index)} />);			
			//return (<Tab label={label} {...a11yProps(index)} />);
		});
		// Special tab to create channel
		labels.push(<Tab key={labels.length} icon={<AddIcon />} {...a11yProps(labels.length)} />)

		return (labels);
	}

	generateTabPanels() : JSX.Element[]
	{
		let panels = this.state.channels.map((channel, index) => {
			return (<ChannelTabPanel key={index} value={this.state.current_channel_idx} index={index} channel={channel} sendMessage={this.sendMessage} current_user={channel.users.filter((u) => u.id === this.state.user_id)[0]}/>)
		});
		// Special tab panel to create channel
		panels.push(<NewChannelTabPanel key={panels.length} value={this.state.current_channel_idx} index={panels.length} />)
		return (panels);
	}

	channelSettingsDialogCallback = async (usePassword: boolean, password: string | null, user: number, channel: ChatChannel) => {
		console.log(password)
		console.log(user)

		// password was added, removed or modified
		if ((usePassword && channel.visibility == "PUBLIC") || (!usePassword && channel.visibility == "PRIVATE")|| (password != null && password !== ""))
		{
			console.log("Modifying password")
			await fetch(`http://${window.location.hostname}:8190/chat/channel/`+channel.id, {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json',
				...(fetch_opt().headers)
				},
				body: JSON.stringify({operation: "CHANGE_PASSWORD", parameter: password})
			});
		}

		if (user != -1)
		{
			console.log("Adding user")
			await fetch(`http://${window.location.hostname}:8190/chat/channel/`+channel.id, {
				method: 'PUT',
				headers: {
				'Content-Type': 'application/json',
				...(fetch_opt().headers)
				},
				body: JSON.stringify({operation: "ADD_USER", parameter: user})
			});
	
		}
		this.setState({displaySettingsDialog: false, anchorEl: null});
	}

	generateChat() : JSX.Element
	{
		if (this.state.show)
		{
			// Sort by type and by date within those types
			// Cringe
			/*this.state.channels.sort((a, b) => {
				const _a = a.last_message ? a.last_message : new Date(0)
				const _b = b.last_message ? b.last_message : new Date(0)

				return a.visibility.localeCompare(b.visibility) || _b.getTime() - _a.getTime();
			})
			*/

			// Generate tab labels
			const tab_labels = this.generateTabLabels()
			const tab_panels = this.generateTabPanels()

			return (
				<div>
					{this.state.current_channel_id !== -1 && <Menu
					id="basic-menu"
					anchorEl={this.state.anchorEl}
					open={Boolean(this.state.anchorEl)}
					onClose={(e) => (this.setState({anchorEl: null}))}
					MenuListProps={{
					'aria-labelledby': 'basic-button',
					}}
					>
						<MenuItem onClick={this.handleSettingsDialog} value={this.state.current_channel_id}>Settings</MenuItem>
						<MenuItem onClick={this.handleLeaveChannel} value={this.state.current_channel_id} sx={{color: "red"}}>Leave</MenuItem>
						{Boolean(this.state.channels.filter((c) => c.id == this.state.current_channel_id)[0].users.find((u) => u.id === this.state.user_id && u.power === "OWNER")) &&
						<MenuItem onClick={this.handleDeleteChannel} value={this.state.current_channel_id} sx={{color: "red"}}>Delete</MenuItem>}
					</Menu>}
					{this.state.displaySettingsDialog && <ChannelSettingsDialog functionCallback={this.channelSettingsDialogCallback} closeCallback={(e: any) => this.setState({displaySettingsDialog: false, anchorEl: null})} open={this.state.displaySettingsDialog} 
					channel={this.state.channels.filter((c) => c.id == this.state.current_channel_id)[0]} owner={Boolean(this.state.channels.filter((c) => c.id == this.state.current_channel_id)[0].users.find((u) => u.id === this.state.user_id && u.power === "OWNER"))}/>}
					<Tabs orientation="vertical" variant="scrollable" value={this.state.current_channel_idx} onChange={this.changeChannel} aria-label="Chat channels"
						sx={{ borderRight: 1, borderColor: 'divider' }}
					>
						{tab_labels}
					</Tabs>
					{tab_panels}
				</div>)
		}
		return <></>
	}

	render()
	{
		const tabs = this.generateChat();
		
		return (
			<Box sx={{ flexGrow: 1, display: 'flex', height: 500}}>
				{this.state.show && tabs}
			  	<Fab color="primary" aria-label="chat" onClick={this.toggleDiv}>
						<ChatIcon />
			  	</Fab>	  
			</Box>
		  );			
	}
}

export default ChatComponent;
