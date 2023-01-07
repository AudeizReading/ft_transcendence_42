import React from 'react';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/system/Unstable_Grid';

//import Divider from '@mui/material/Divider';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
//import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { User } from '../interface/User';

import TextField from '@mui/material/TextField';

// DashboardCard
function DashboardCard(props: any)
{
	const [openSettings, setOpenSettings] = useState(false);
	const [openMore, setOpenMore] = useState(false);
	const [sxOpenMore, setSxOpenMore] = useState({
		transform: 'rotate(0deg)',
		transition: 'width ease 4ms, height ease 4ms',
	});
	const [sxCardContent, setSxCardContent] = useState({
		px: '5%',
		height: '2vh',
		width: '90%',
		overflow: 'hidden',
		overflowWrap: 'break-word',
		transition: 'height ease 4ms',
	});

	const handleOpenSettings = () => setOpenSettings(true);
	const handleCloseSettings = () => setOpenSettings(false);
	const handleOpenMore = () => setOpenMore(true);
	const handleCloseMore = () => setOpenMore(false);

	const handleCardEdit = () => {
		handleCloseSettings();
		props.onEditClick();
	};

	const handleMoreClick = () => {
		if (openMore)
		{
			handleCloseMore();
			setSxOpenMore({...sxOpenMore, transform: 'rotate(0deg)'});
			setSxCardContent({
				...sxCardContent,
				overflow: 'hidden',
				height: '2vh',
			});
		}
		else
		{
			handleOpenMore();
			setSxOpenMore({...sxOpenMore, transform: 'rotate(180deg)'});
			setSxCardContent({
				...sxCardContent,
				overflow: 'visible',
				height: 'auto',
			});
		}
		console.log(openMore);
	};

	const handleTrashClick = () => {
		setOpenSettings(false);
		console.log("DashboardCard handleTrashClick", props)
		props.onTrashClick(props.uid, props.colUid);
	};

	return (
		<Card key={props.uid} variant={'elevation'} elevation={8} sx={{...props.sx, px: '2%'}}>
			<CardHeader 
					action={
						!openSettings
						? <IconButton aria-label='settings' onClick={handleOpenSettings}>
							<MoreVertIcon color='secondary' fontSize={"large"}/>
						</IconButton>
						: <Box component="div" >
							<IconButton aria-label='edit' onClick={handleCardEdit} >
								<EditIcon color='secondary' fontSize={"small"} />
							</IconButton>
							<IconButton aria-label='delete' onClick={handleTrashClick}>
								<DeleteIcon color='secondary' fontSize={"small"} />
							</IconButton>
						</Box>
					}
					title={props.title}
					subheader={props.subheader}
			/>
			<CardContent sx={sxCardContent}>
				{props.children}
			</CardContent>
			<CardActions sx={{display: 'flex', justifyContent: 'flex-end'}}>
				<IconButton aria-label='more' onClick={handleMoreClick}>
					<ExpandMoreIcon color='secondary' fontSize={"large"} sx={sxOpenMore}/>
				</IconButton>
			</CardActions>
		</Card>
	);
}

function DashboardCardForm(props: any)
{
	// Menu deroulant ?
	// https://mui.com/material-ui/react-text-field/

	const [content, setContent] = useState(props.content || '');
	const [title, setTitle] = useState(props.title || '');
	const [subheader, setSubheader] = useState(props.subheader || '');
	const submitText = props.uid ? 'Update' : 'Create';

	function handleContentChange(e: any)
	{
		setContent(e.target.value);
	}

	function handleTitleChange(e: any)
	{
		setTitle(e.target.value);
	}

	function handleSubheaderChange(e: any)
	{
		setSubheader(e.target.value);
	}

	const handleSubmit = () => {
		title.length !== 0 && subheader.length !== 0 && content.length !== 0 &&
		props.onFormSubmit({
			title: title,
			subheader: subheader,
			content: content,
			customSx: {},
			key: props.uid || title, // il faut changer ca
		});
	};

	return (
		<Card key={props.uid} sx={{...props.sx, overflow: 'scroll', height: '50vh', width: '50vw', m: 'auto'}} variant={'elevation'} elevation={8}>
			<CardHeader sx={{display: 'flex', flexFlow: 'column', justifyContent: 'center'}} title={submitText}/>

			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}}
					required variant="outlined" 
					label="Title" 
					onChange={handleTitleChange} 
					placeholder={props.title} 
					value={title}/>
			</CardContent>
			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}}
					required variant="outlined" 
					label="Subheader" 
					onChange={handleSubheaderChange} 
					placeholder={props.subheader} 
					value={subheader}/>
			</CardContent>
			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}} 
					required variant="outlined" 
					multiline={true} 
					label="Content" 
					placeholder={props.content} 
					onChange={handleContentChange} 
					value={content}/>
			</CardContent>
			<CardActions 
				sx={{display: 'flex', justifyContent: 'space-around'}}>
				<IconButton 
					size={"large"} 
					aria-label='submit' 
					onClick={handleSubmit}>
					<CheckIcon color='success' fontSize={"large"}/>
				</IconButton>
				<IconButton 
					size={"large"} 
					aria-label='cancel' 
					onClick={props.onFormClose}>
					<CancelIcon color='error' fontSize={"large"}/>
				</IconButton>
			</CardActions>
		</Card>
		);
}

function EditableDashboardItem(props: any)
{
	const [edit, setEdit] = useState(false);

	const handleCardEdit = () => openForm();
	const handleFormClose = () => closeForm();

	const handleSubmit = (item: any) => {
		props.onFormSubmit(item);
		closeForm();
	};

	const openForm = () => setEdit(true);
	const closeForm = () => setEdit(false);

	return (
		edit 
			? <DashboardCardForm 
				title={props.title}
				subheader={props.subheader} 
				content={props.children} 
				uid={props.uid}
				colUid={props.colUid}
				onFormSubmit={handleSubmit} 
				onFormClose={handleFormClose}
				sx={{...props.sx}}
			/> 
			: <DashboardCard  
				title={props.title} 
				subheader={props.subheader}
				children={props.children}
				uid={props.uid}
				colUid={props.colUid}
				onEditClick={handleCardEdit}
				onTrashClick={props.onTrashClick}
				sx={{...props.sx}}
			/>
	);
}

function DashboardListItem(props: any)
{
	const [items, setItems] = useState<any[]>(props.children);

	useEffect(() => setItems(() => props.children), [props.children]);

	return (<Box component="div" sx={{border: '1px solid green', width: '95%', mx: 'auto', px: '2vw', py: '2vh'}}>
		{
			items.map((item) => (
			<EditableDashboardItem  
				key={item.key}
				colUid={props.uid}
				uid={item.key}
				title={item.title}
				subheader={item.subheader}
				onFormSubmit={props.onFormSubmit}
				onTrashClick={props.onTrashClick}
				sx={{border: '1px solid purple', marginBottom: '5vh', height: 'auto'}}
			>
				{item.content}
			</EditableDashboardItem>))
		}
	</Box>);
}

function ToggableDashboardCardForm(props: any)
{
	const [open, setOpen] = useState(false);

	function handleItemOpen()
	{
		setOpen(true);
	}

	function handleFormClose()
	{
		setOpen(false);
	}

	const handleFormSubmit = (item: any) => {
		console.log("ToggableDashboardCardForm handleFormSubmit: ", item);
		props.onFormSubmit(item);
		setOpen(false);
	}

	return (
		<Grid xs={12} sx={props.sx}>
			{ 
				open
				? <DashboardCardForm 
					uid={props.uid}
					colUid={props.colUid}
					onFormSubmit={handleFormSubmit}
					onFormClose={handleFormClose}
					/> 
				: <Fab aria-label='add-item' onClick={handleItemOpen} sx={{display: 'block', m: 'auto'}}>
					<AddIcon/>
				</Fab>
			}
		</Grid>
	);
}

// DashboardColumn
function DashboardColumn(props: any)
{
	const [datas, setDatas] = useState(props.children);

	useEffect(() => {setDatas(props.children)}, [props.children]);
	const handleCreateFormSubmit = (item: any) =>
	{
		console.log("DashboardColumn handleCreateFormSubmit", item, datas, props.uid);
		props.onFormSubmit([...datas, item], props.uid);
	};

	const handleEditFormSubmit = (item: any) => {
		updateItem(item);
	};

	const updateItem = (updatedDatas: any) => {
		console.log("DashboardColumn updateItem updatedDatas: ", updatedDatas);
		props.onFormSubmit(datas.map((item: any) => {
			if (updatedDatas.key === item.key)
			{
				return Object.assign({}, item, {title: updatedDatas.title, subheader: updatedDatas.subheader, content: updatedDatas.content});
			}
			else
				return item;
		}), props.uid);
	};

	const handleTrashClick = (itemId: any) => {
		deleteItem(itemId);
	};

	const deleteItem = (itemId: any) => {
		props.onFormSubmit(datas.filter((item: any) => item.key !== itemId), props.uid, datas, itemId);
	}

	const lastItemId = (datas: any) => {return (datas[datas.length - 1].key || props.uid + 1);};

	//console.log(lastItemId(datas));
	return (
		<Grid container rowSpacing={1} xs={props.xs} sx={{border: '1px solid red', height: '100%'}}>
			{
				<DashboardListItem
					key={props.uid}
					uid={props.uid}
					children={props.children} 
					onFormSubmit={handleEditFormSubmit}
					onTrashClick={handleTrashClick}/>
			}
			{
				<ToggableDashboardCardForm colUid={props.uid} uid={lastItemId(datas) + 1} sx={{m: 'auto', width: '100%'}} onFormSubmit={handleCreateFormSubmit}/>
			}
		</Grid>
	);
}

function DashboardColumnForm(props: any)
{
	// Menu deroulant ?
	// https://mui.com/material-ui/react-text-field/

	const [content, setContent] = useState(props.content || '');
	const [title, setTitle] = useState(props.title || '');
	const [subheader, setSubheader] = useState(props.subheader || '');
	const [size, setSize] = useState(props.xs || 12);

	const submitText = props.colUid ? 'Update' : 'Create';

	function handleContentChange(e: any)
	{
		setContent(e.target.value);
	}

	function handleTitleChange(e: any)
	{
		setTitle(e.target.value);
	}

	function handleSubheaderChange(e: any)
	{
		setSubheader(e.target.value);
	}

	function handleXsChange(e: any)
	{
		setSize(e.target.value);
	}

	const handleSubmit = () => {
		title.length !== 0 && subheader.length !== 0 && content.length !== 0 &&
		props.onFormSubmit({
			items: [
			{
				title: title,
				subheader: subheader,
				content: content,
				customSx: {},
				key: props.uid || title, // il faut changer ca
			},],
			key: props.colUid,
			xs: size,
			sx: {},
		});
	};


	return (
		<Card key={props.uid} sx={{...props.sx, border: '15px solid pink', position: 'sticky', zIndex: 100, width: '60%', m: 'auto'}} variant={'elevation'} elevation={8}>
			<CardHeader sx={{display: 'flex', flexFlow: 'column', justifyContent: 'center'}} title={submitText}/>

			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}}
					required variant="outlined" 
					label="Title" 
					onChange={handleTitleChange} 
					placeholder={props.title} 
					value={title}/>
			</CardContent>
			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}}
					required variant="outlined" 
					label="Subheader" 
					onChange={handleSubheaderChange} 
					placeholder={props.subheader} 
					value={subheader}/>
			</CardContent>
			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}} 
					required variant="outlined" 
					multiline={true} 
					label="Content" 
					placeholder={props.content} 
					onChange={handleContentChange} 
					value={content}/>
			</CardContent>
			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}} 
					required variant="outlined" 
					multiline={true} 
					label="Size" 
					placeholder={props.xs} 
					onChange={handleXsChange} 
					value={size}/>
			</CardContent>
			<CardActions 
				sx={{display: 'flex', justifyContent: 'space-around'}}>
				<IconButton 
					size={"large"} 
					aria-label='submit' 
					onClick={handleSubmit}>
					<CheckIcon color='success' fontSize={"large"}/>
				</IconButton>
				<IconButton 
					size={"large"} 
					aria-label='cancel' 
					onClick={props.onFormClose}>
					<CancelIcon color='error' fontSize={"large"}/>
				</IconButton>
			</CardActions>
		</Card>
		);
}

function ToggableDashboardColumnForm(props: any)
{
	const [open, setOpen] = useState(false);

	function handleItemOpen()
	{
		setOpen(true);
	}

	function handleFormClose()
	{
		setOpen(false);
	}

	const handleFormSubmit = (item: any) => {
		console.log("ToggableDashboardColumnForm: ", item);
		props.onFormSubmit(item);
		setOpen(false);
	}

	return (
		<Grid xs={12} sx={props.sx}>
			{ 
				open
				? <DashboardColumnForm 
					uid={props.uid}
					colUid={props.colUid}
					onFormSubmit={handleFormSubmit}
					onFormClose={handleFormClose}
					sx={props.sx}
					/> 
				: <Fab 
					aria-label='add-item' 
					color='secondary' 
					onClick={handleItemOpen} 
					sx={{
						display: 'block',
						m: 'auto'
					}}
				>
					<AddIcon/>
				</Fab>
			}
		</Grid>
	);
}

function Dashboard(props: {user: User})
{
	const [user, setUser] = useState(props.user);

	const emptyDatas = () => ([{
		items: [{
			title: '',
			subheader: '',
			content: '',
			customSx: {},
			key: 0,
			}],
		key: 0,
		xs: 0,
		sx: {},
	},]);

	const [datas, setDatas] = useState(emptyDatas());
	// juste pour tester, datas a fetch
	/*const [datas, setDatas] = useState([
	{
		items: [
			{
				title: 'first title',
				subheader: 'first subheader',
				content: 1,
				customSx: {},
				key: 1,
			}, 
			{
				title: 'second title',
				subheader: 'second subheader',
				content: 2,
				customSx: {},
				key: 2,
			}, 
			{
				title: 'third title',
				subheader: 'third subheader',
				content: 3,
				customSx: {},
				key: 3,
			},
		],
		key: 100,
		xs: 3,
		sx: {
			border: '1px solid black', 
			height: '100%',
		},
	}, 
	{
		items: [
			{
				title: 'first title',
				subheader: 'first subheader',
				content: 'Welcome',
				customSx: {},
				key: 5,
			}, 
			{
				title: 'second title',
				subheader: 'second subheader',
				content: 'Youpi',
				customSx: {},
				key: 6,
			}, 
			{
				title: 'third title',
				subheader: 'third subheader',
				content: 'Hello World',
				customSx: {},
				key: 7,
			}, 
			{
				title: 'fourth title',
				subheader: 'fourth subheader',
				content: 'Hello World',
				customSx: {},
				key: 8,
			},
		],
		key: 200,
		xs: 5,
		sx: {
			border: '1px solid black', 
			height: '100%',
		},
	}, 
	{
		items: [
			{
				title: 'first title',
				subheader: 'first subheader',
				content: 'first content',
				customSx: {},
				key: 10,
			}, 
			{
				title: 'second title',
				subheader: 'second subheader',
				content: 'second content',
				customSx: {},
				key: 11,
			}, 
			{
				title: 'third title',
				subheader: 'third subheader',
				content: 'third content',
				customSx: {},
				key: 12,
			}, 
			{
				title: 'fourth title',
				subheader: 'fourth subheader',
				content: 'fourth content',
				customSx: {},
				key: 13,
			}, 
			{
				title: 'fifth title',
				subheader: 'fifth subheader',
				content: 'fifth content',
				customSx: {},
				key: 14,
			}, 
			{
				title: 'sixth title',
				subheader: 'sixth subheader',
				content: 'sixth content',
				customSx: {},
				key: 15,
			}, 
			{
				title: 'seventh title',
				subheader: 'seventh subheader',
				content: 'seventh content',
				customSx: {},
				key: 16,
			}, 
			{
				title: 'eigth title',
				subheader: 'eigth subheader',
				content: 'eigth content',
				customSx: {},
				key: 17,
			},
		],
		key: 300,
		xs: 4,
		sx: {
			border: '1px solid black', 
			height: '100%',
		},
	}, 
	]); */// will change to the users datas but now not connected to bdd so simulate datas

	const handleCreateColumnSubmit = (column: any) => {
		console.log("create column event", column);
		if (datas[0].key !== 0) {
			datas.push(column);
		}
		else
			datas[0] = column;
	};

	useEffect(() => setUser(props.user), [props.user]);
	useEffect(() => setDatas((datas) => [...datas]), []);
	
	const handleUpdateColumn = (item: any, uid: any) => {

		console.log("Dashboard handleUpdateColumn: ", uid, item);
		datas.map((data) => {
			if (uid === data.key)
			{
				data.items = item;
				console.log("Dashboard handleUpdateColumn: ", data, item, uid);
			}
			return item;
		});
	};

	const lastColumnId = (datas: any) => {return (datas[datas.length - 1].key || 0);};
	return (
		<Box component='div' sx={{width: '100%', height: '100%'}}>
			<Box component="h2">Glad to see you, {user.name}!</Box>
			<Grid 
				container 
				rowSpacing={1} 
				xs={12} 
				sx={{border: '1px solid black', width: '100%'}}>
				{
					(datas.length > 0 && datas[0].key !== 0 && datas[0].key !== undefined)
					&& datas.map((data: any) => 
					{
						return (
							<DashboardColumn 
								key={data.key}
								uid={data.key}
								xs={parseInt(data.xs)} 
								children={data.items}
								sx={{
									border: '1px solid pink'
								}}
								onFormSubmit={handleUpdateColumn} 
							/>
						)
					})
				}
			</Grid>
			<ToggableDashboardColumnForm 
				uid={lastColumnId(datas) + 101} 
				colUid={lastColumnId(datas) + 100} 
				onFormSubmit={handleCreateColumnSubmit}
				sx={{
					position: 'relative',
					top: '10%',
					left: '0%',
				}}
			/>
		</Box>
	);
}

export default Dashboard;