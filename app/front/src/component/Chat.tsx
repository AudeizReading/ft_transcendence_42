import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/ChatBubble';
import { fetch_opt } from '../dep/fetch'
import socketIOClient, { Socket } from "socket.io-client";

interface ChatUser {
	id: number;
	name: string;
	power: string;
}

interface ChatMessage {
	sender_name: string;
	content: string;
	time: Date;
}

interface ChatChannel {
	name: string;
	type: string;
	users: ChatUser[];
	messages: ChatMessage[];
	fetched: boolean;
	last_message?: Date;
}


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  messages: ChatMessage[]
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, messages, ...other} = props;

  const msgList = messages.map((message, index) => {
	return <Box sx={{ p: 3 }}><Typography>{message.time.toTimeString().split(' ')[0]} {message.sender_name}: {message.content}</Typography></Box>
  })

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && msgList}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

class ChatComponent extends React.Component<{}, {show: boolean, channels: ChatChannel[], current_channel_idx: number}> {
	private socket: Socket;

	constructor(props: any)
	{
		super(props);
		this.state = {show: false, channels: [
			{name: "test", type: "test", users: [{id: 1, name: "willy", power: "test"}], messages: [{sender_name: "willy", time: new Date(1000), content: "test"}], fetched: true},
			{name: "test 2", type: "PRIVATE_MESSAGE", users: [{id: 1, name: "fanny", power: "test"},{id: 1, name: "fafa", power: "test"}], messages: [{sender_name: "fanny", time: new Date(2000), content: "test"}], fetched: true},
			],
			current_channel_idx: 0};
		this.socket = socketIOClient('ws://' + window.location.hostname + ':8192/chat', {extraHeaders: fetch_opt().headers});
		this.socket.on('recv_msg', (newData: any) => {
			console.log(newData);
		});
	
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

	render()
	{
		// Sort by type and by date within those types
		this.state.channels.sort((a, b) => {
			const _a = a.last_message ? a.last_message : new Date(0)
			const _b = b.last_message ? b.last_message : new Date(0)

			return a.type.localeCompare(b.type) || _b.getTime() - _a.getTime();
		})

		// Generate tab labels
		const tab_labels = this.state.channels.map((channel, index) => {
			let name: string = channel.name;
			if (channel.type === "PRIVATE_MESSAGE")
				name = "PM: " + channel.users[0].name + " - " + channel.users[1].name;
			const label = name + " (" + channel.users.length + ")"
			return (<Tab label={label} {...a11yProps(index)} />);
		});

		// Generate tab panels
		const tab_panels = this.state.channels.map((channel, index) => {
			return (<TabPanel value={this.state.current_channel_idx} index={index} messages={channel.messages} />)
		})

		return (
			<Box
			  sx={{ flexGrow: 1, display: 'flex', height: 500 }}
			>
			  <Tabs
				orientation="vertical"
				variant="scrollable"
				value={this.state.current_channel_idx}
				onChange={this.changeChannel}
				aria-label="Chat channels"
				sx={{ borderRight: 1, borderColor: 'divider' }}
			  >
				{tab_labels}
			  </Tabs>
			  {tab_panels}
			  <Fab color="primary" aria-label="chat" onClick={this.toggleDiv}>
				<ChatIcon />
			  </Fab>	  
			</Box>
		  );			
	}
	/*
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        <Tab label="Item One" {...a11yProps(0)} />
        <Tab label="Item Two" {...a11yProps(1)} />
        <Tab label="Item Three" {...a11yProps(2)} />
        <Tab label="Item Four" {...a11yProps(3)} />
        <Tab label="Item Five" {...a11yProps(4)} />
        <Tab label="Item Six" {...a11yProps(5)} />
        <Tab label="Item Seven" {...a11yProps(6)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Four
      </TabPanel>
      <TabPanel value={value} index={4}>
        Item Five
      </TabPanel>
      <TabPanel value={value} index={5}>
        Item Six
      </TabPanel>
      <TabPanel value={value} index={6}>
        Item Seven
      </TabPanel>
	  <Fab color="primary" aria-label="chat" onClick={}>
	    <ChatIcon />
	  </Fab>
    </Box>
  );
  */
}

export default ChatComponent;
