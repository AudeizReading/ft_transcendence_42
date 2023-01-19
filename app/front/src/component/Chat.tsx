import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Avatar, Button, Fab, Grid, IconButton, InputLabel, ListItemAvatar, ListItemText, Menu, MenuItem, Paper, Select, TextField } from '@mui/material';
import ChatIcon from '@mui/icons-material/ChatBubble';
import AddIcon from '@mui/icons-material/Add';
import { fetch_opt } from '../dep/fetch'
import socketIOClient, { Socket } from "socket.io-client";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface ChatUser {
	id: number;
	name: string;
	power: string;
	avatar: string;
}

interface ChatMessage {
	sender_name: number;
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
  switchChannelCallback: any;
}

function ChannelTabPanel(props: ChannelTabPanelProps) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

  	const { children, value, index, channel, sendMessage, current_user, switchChannelCallback, ...other} = props;

  	const [message, setMessage] = React.useState("")

  	const inputRef = React.useRef<HTMLInputElement>(null);

	const handlePrivateMessage = async (e: any) => {
		e.preventDefault()
		const { user } = e.currentTarget.dataset;
		const result = await fetch(`http://${window.location.hostname}:8190/chat/channel/new`, {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  ...(fetch_opt().headers),
			},
			body: JSON.stringify({name: "<DM>", password: null, users: [current_user.id, user.id], visibility: "PRIVATE_MESSAGE"}),
		});
		switchChannelCallback(result.id)
	}

	const handleClickOnUser = (e: any) => {
		e.preventDefault()
		setAnchorEl(e.currentTarget);
		const user: number = e.target.id as number;
	};
	
	const handleClose = () => {
		setAnchorEl(null);
	};

  const msgList = channel.messages.map((message, index) => {
	return <Grid item><Typography>{message.time.toTimeString().split(' ')[0]} {message.sender_name}: {message.content}</Typography></Grid>
  })

  const channel_users = channel.users.map((user) => {
	  return (
		<Grid item>
			<div id={String(user.id)}
				onClick={user.id == current_user.id ? undefined : handleClickOnUser}
			>
	  			<Avatar alt={user.name} src={user.avatar} />
				<Typography>{user.name}</Typography>
			</div>
			<Menu
			id="basic-menu"
			anchorEl={anchorEl}
			open={open}
			onClose={handleClose}
			MenuListProps={{
			'aria-labelledby': 'basic-button',
			}}
			>
				<MenuItem onClick={handlePrivateMessage} data-value={user}>DM</MenuItem>
				<MenuItem onClick={handleBlock} data-value={user}>Block</MenuItem>
				{current_user.power === "OWNER" && <MenuItem onClick={handlePromote} data-value={user}>{user.power === "ADMINISTRATOR" ? "Demote" : "Promote"}</MenuItem>}
				{current_user.power !== "REGULAR" && user.power === "REGULAR" && <MenuItem onClick={handleMute} data-value={user}>{user.muted ? "Unmute" : "Mute"}</MenuItem>}
				{current_user.power !== "REGULAR" && user.power === "REGULAR" &&  <MenuItem onClick={handleBan} data-value={user}>{user.banned ? "Unban" : "Ban"}</MenuItem>}

			</Menu>

		</Grid>
	  )
  })

  const send_message = async () => {
	sendMessage(message, channel.id)
	inputRef.current!.focus()
	setMessage("")
  }

  const channel_chat_interface = (
	  <div>
		<Grid container xs={9} direction="column" sx={{height: "90%"}}>
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
  
	interface AddableUser {id: number;name: string;avatar: string;}

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

class ChatComponent extends React.Component<{}, {show: boolean, channels: ChatChannel[], current_channel_idx: number, socket: Socket}> {
	constructor(props: any)
	{
		super(props);
		this.state = {show: false, channels: [], current_channel_idx: 0, socket: socketIOClient('ws://' + window.location.hostname + ':8192/chat', {extraHeaders: fetch_opt().headers})};
	}

	async componentDidMount()
	{
		this.state.socket.on('recv_msg', (newData: any) => {
			console.log(newData);
		});

		const data = await fetch('http://' + window.location.hostname + ':8190/chat', fetch_opt())
		if (data.ok)
		{
			/*
			interface ChatUser {
				id: number;
				name: string;
				power: string;
			}

			interface ChatMessage {
				sender_name: number;
				content: string;
				time: Date;
			}

			interface ChatChannel {
				name: string;
				visibility: string;
				users: ChatUser[];
				messages: ChatMessage[];
				notif: boolean;
				fetched: boolean;
				last_message?: Date;
			}
 			*/
			// Flatten the data so it can be directly applied to the state
			const json = await data.json();
			this.setState({channels: json.map((e: any) => {
				return ({
					id: e.id,
					name: e.name,
					visibility: e.visibility,
					users: e.users.map((user: any) => ({id: user.user.id, name: user.user.name, avatar: user.user.avatar, power: user.power})),
					messages: e.messages.map((m: any) => ({sender_name: m.sender.user.name, content: m.content, time: new Date(m.sent_at)})),
					notif: false,
					fetched: true,
					last_message: e.messages.length ? new Date(e.messages[0].sent_at) : new Date()
				})
			})})
		}
	}

	// Doesnt work
	sendMessage = (content: string, channel_id: number) => {
		this.state.socket.emit("send_message", {content: content, channel: channel_id})
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

	generateTabLabels() : JSX.Element[]
	{
		let labels = this.state.channels.map((channel, index) => {
			let name: string = channel.name;
			if (channel.visibility === "PRIVATE_MESSAGE")
				name = "PM: " + channel.users[0].name + " - " + channel.users[1].name;
			const label = name + " (" + channel.users.length + ")"
			return (<Tab label={label} {...a11yProps(index)} />);
		});
		// Special tab to create channel
		labels.push(<Tab icon={<AddIcon />} {...a11yProps(labels.length)} />)

		return (labels);
	}

	generateTabPanels() : JSX.Element[]
	{
		let panels = this.state.channels.map((channel, index) => {
			return (<ChannelTabPanel value={this.state.current_channel_idx} index={index} channel={channel} sendMessage={this.sendMessage} />)
		});
		// Special tab panel to create channel
		panels.push(<NewChannelTabPanel value={this.state.current_channel_idx} index={panels.length} />)
		return (panels);
	}

	generateChat() : JSX.Element
	{
		if (this.state.show)
		{
			// Sort by type and by date within those types
			this.state.channels.sort((a, b) => {
				const _a = a.last_message ? a.last_message : new Date(0)
				const _b = b.last_message ? b.last_message : new Date(0)

				return a.visibility.localeCompare(b.visibility) || _b.getTime() - _a.getTime();
			})

			// Generate tab labels
			const tab_labels = this.generateTabLabels()
			const tab_panels = this.generateTabPanels()

			return (
				<div>
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
			<Box sx={{ flexGrow: 1, display: 'flex', height: 500 }}>
				{this.state.show && tabs}
			  	<Fab color="primary" aria-label="chat" onClick={this.toggleDiv}>
					<ChatIcon />
			  	</Fab>	  
			</Box>
		  );			
	}
}

export default ChatComponent;
