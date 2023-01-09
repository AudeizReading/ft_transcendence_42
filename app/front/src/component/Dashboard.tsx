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
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';

import { User } from '../interface/User';


import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

interface IItem {
	title: String,
	subheader: String,
	content: String | {},
	customSx?: {},
	key: String,
}

interface IItemArray {
	[index: number]: IItem;
}

interface IColumn {
	items: IItemArray,
	key: String,
	xs: Number,
	sx?: {},
}

// DashboardCard
function DashboardCard(props: any)
{
	const [openSettings, setOpenSettings] = useState(false);
	const [openMore, setOpenMore] = useState(false);
	const [sxOpenMore, setSxOpenMore] = useState({
		transform: 'rotate(0deg)',
		transition: 'width ease 4ms, height ease 4ms, transform ease 4ms',
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
			setSxOpenMore({
				...sxOpenMore, 
				transform: 'rotate(0deg)'
			});
			setSxCardContent({
				...sxCardContent,
				overflow: 'hidden',
				height: '2vh',
			});
		}
		else
		{
			handleOpenMore();
			setSxOpenMore({
				...sxOpenMore, 
				transform: 'rotate(180deg)'
			});
			setSxCardContent({
				...sxCardContent,
				overflow: 'visible',
				height: 'auto%',
			});
		}
	};

	const handleTrashClick = () => {
		setOpenSettings(false);
		console.log("DashboardCard handleTrashClick", props)
		props.onTrashClick(props.uid, props.colUid);
	};

	return (
		<Card 
			key={props.uid} 
			variant={'elevation'} 
			elevation={8} 
			sx={{
				width: '99%',
				m: 'auto',
			}}
		>
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
			<CardContent 
				sx={sxCardContent}
			>
				{props.children}
			</CardContent>
			<CardActions 
				sx={{
					display: 'flex', 
					justifyContent: 'flex-end'
				}}
			>
				<IconButton aria-label='more' onClick={handleMoreClick}
				>
					<ExpandMoreIcon color='secondary' fontSize={"large"} sx={sxOpenMore}
					/>
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
	const submitText = props.content ? 'Update' : 'Create';
	console.log(props.uid);

	const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setContent(e.target.value);
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTitle(e.target.value);
	const handleSubheaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSubheader(e.target.value);

	const handleSubmit = () => {
		title.length !== 0 && subheader.length !== 0 && content.length !== 0 &&
		props.onFormSubmit({
			title: title,
			subheader: subheader,
			content: content,
			customSx: {},
			key: props.uid,
		} as IItem);
	};

	return (
		<Card 
			key={props.uid} 
			sx={{
				...props.sx, 
				overflow: 'scroll', 
				height: 'auto', 
				width: '50vw', 
				m: 'auto',
				position: 'absolute',
				zIndex: 2000,
				top: '20vh',
				bottom: '10vh',
				left: '25vw',
				transition: 'position ease-in-out 4ms, height ease-in-out 4ms, margin ease-in-out 4ms'
			}} 
			variant={'elevation'} 
			elevation={8}
		>
			<CardHeader 
				sx={{
					display: 'flex', 
					flexFlow: 'column', 
					justifyContent: 'center'
				}} 
				title={submitText}
			/>

			<CardContent 
				sx={{
					mx: '2%',
				}}
			>
				<TextField 
					required
					variant="outlined" 
					label="Title"
					autoFocus={true}
					error={true}
					fullWidth={true}
					margin="dense"
					color="primary"
					name="title"
					size="medium"
					helperText="the title of the event"
					id={props.uid + "-input-text-title"}
					placeholder={props.title} 
					value={title} 
					onChange={handleTitleChange}
				/>
			</CardContent>
			<CardContent 
				sx={{
					mx: '2%',
				}}
			>
				<TextField 
					required variant="outlined" 
					label="Subheader" 
					autoFocus={false}
					error={true}
					fullWidth={true}
					margin="dense"
					color="primary"
					name="subheader"
					size="medium"
					helperText="the subheader of the event"
					id={props.uid + "-input-text-subheader"}
					placeholder={props.subheader} 
					value={subheader}
					onChange={handleSubheaderChange} 
				/>
			</CardContent>
			<CardContent 
				sx={{
					mx: '2%',
				}}
			>
				<TextField
					required variant="outlined" 
					multiline={true} 
					label="Content"  
					autoFocus={false}
					error={true}
					fullWidth={true}
					margin="dense"
					color="primary"
					name="subheader"
					size="medium"
					helperText="the subheader of the event"
					id={props.uid + "-input-text-subheader"}
					placeholder={props.content} 
					value={content}
					onChange={handleContentChange} 
				/>
			</CardContent>
			<CardActions 
				sx={{
					display: 'flex', 
					justifyContent: 'space-around'
				}}
			>
				<IconButton 
					size={"large"} 
					aria-label='submit' 
					onClick={handleSubmit}
				>
					<CheckIcon 
						color='success' 
						fontSize={"large"}
					/>
				</IconButton>
				<IconButton 
					size={"large"} 
					aria-label='cancel' 
					onClick={props.onFormClose}
				>
					<CancelIcon 
						color='error' 
						fontSize={"large"}
					/>
				</IconButton>
			</CardActions>
		</Card>
	);
}

function EditableDashboardItem(props: any)
{
	const [edit, setEdit] = useState(false);

	const openForm = () => setEdit(true);
	const closeForm = () => setEdit(false);

	const handleCardEdit = () => openForm();
	const handleFormClose = () => closeForm();

	const handleSubmit = (item: IItem) => {
		props.onFormSubmit(item);
		closeForm();
	};

	return (<Grid xs={12}  sx={{border: '1px solid yellow', minHeight: '15vh', maxHeight: '25vh',}}>
		{edit 
			? <DashboardCardForm 
				title={props.title}
				subheader={props.subheader} 
				content={props.children} 
				uid={props.uid}
				colUid={props.colUid}
				onFormSubmit={handleSubmit} 
				onFormClose={handleFormClose}
				sx={{}}
			/> 
			: <DashboardCard  
				title={props.title} 
				subheader={props.subheader}
				children={props.children}
				uid={props.uid}
				colUid={props.colUid}
				onEditClick={handleCardEdit}
				onTrashClick={props.onTrashClick}
				sx={{}}
			/>
	}</Grid>);
}

function DashboardListItem(props: any)
{
	const [items, setItems] = useState<IItem[]>(props.children);

	useEffect(() => {setItems(props.children)}, [props.children]);
	return (<React.Fragment>
		{
			items.map((item: IItem) => (
			<EditableDashboardItem  
				key={item.key}
				colUid={props.uid}
				uid={item.key}
				title={item.title}
				subheader={item.subheader}
				onFormSubmit={props.onFormSubmit}
				onTrashClick={props.onTrashClick}
				sx={{
					border: '1px dotted purple',
					marginBottom: '5vh',
				}}
			>
				{item.content}
			</EditableDashboardItem>))
		}
	</React.Fragment>);
}

function ToggableDashboardCardForm(props: any)
{
	const [open, setOpen] = useState(false);

	const handleItemOpen = () => setOpen(true);
	const handleFormClose = () => setOpen(false);

	const handleColumnDelete = () => props.onColumnDelete(props.colUid)
	const handleFormSubmit = (item: IItem) => {
		console.log("ToggableDashboardCardForm handleFormSubmit: ", item);
		props.onFormSubmit(item);
		setOpen(false);
	}

	const handleColumnUpdate = () => console.log("C'est pas encore geré")
	return (
		<Grid xs={12} sx={{...props.sx, border: '5px solid cyan',}}>
			{ 
				open
				? <DashboardCardForm 
					uid={props.uid}
					colUid={props.colUid}
					onFormSubmit={handleFormSubmit}
					onFormClose={handleFormClose}
				/> 
				: <Grid xs={12} sx={{display: 'flex', justifyContent: 'space-around'}}>
					<Fab 
						aria-label='add-item' 
						variant="circular"
						onClick={handleItemOpen} 
						color="primary"
						sx={{
						}}>
						<AddIcon/>
					</Fab>
					<Fab 
						aria-label='add-item' 
						variant="circular"
						onClick={handleColumnDelete} 
						color="primary"
						sx={{
						}}>
						<DeleteForeverTwoToneIcon />
					</Fab>
					<Fab 
						aria-label='add-item' 
						variant="circular"
						onClick={handleColumnUpdate} 
						color="primary"
						sx={{
						}}>
						<SettingsTwoToneIcon/>
					</Fab>
				</Grid>
			}
		</Grid>
	);
}

//function
// DashboardColumn
function DashboardColumn(props: any)
{
	const [datas, setDatas] = useState(props.children as Array<IItem>);

	useEffect(() => {setDatas(props.children)}, [props.children]);
	
	const handleCreateFormSubmit = (item: IItem) =>
	{
		console.log("DashboardColumn handleCreateFormSubmit", item, datas, props.uid);
		props.onFormSubmit([...datas, item], props.uid);
	};

	const handleEditFormSubmit = (item: IItem) => updateItem(item);

	const updateItem = (updatedDatas: IItem) => {
		console.log("DashboardColumn updateItem updatedDatas: ", updatedDatas);
		props.onFormSubmit(datas.map((item: IItem) => {
			if (updatedDatas.key === item.key)
			{
				return Object.assign({}, item, {
					title: updatedDatas.title,
				 	subheader: updatedDatas.subheader, 
				 	content: updatedDatas.content,
				 }) as IItem;
			}
			else
				return item;
		}), props.uid);
	};

	const handleTrashClick = (itemId: String) => deleteItem(itemId);
	const deleteItem = (itemId: String) => props.onFormSubmit(datas.filter((item: IItem) => item.key !== itemId), props.uid, datas, itemId);

	const lastItemId = (datas: Array<IItem>) => ((datas.length > 0) ? datas[datas.length - 1].key :  props.uid + '-item-' + 1);

	const handleColumnDelete = (colUid: String) => props.onColumnDelete(colUid);
	return (
		<Grid container xs={parseInt(props.xs)} sx={{
			border: '1px solid red', 
			display: 'flex', 
			flexDirection: 'column-reverse', 
			justifyContent: 'flex-end',
			alignItems: 'center',
			height: '100%',
		}}>
			{
				<DashboardListItem
					key={props.uid}
					uid={props.uid}
					children={props.children} 
					onFormSubmit={handleEditFormSubmit}
					onTrashClick={handleTrashClick}/>
			}
			{
				<ToggableDashboardCardForm 
					colUid={props.uid} 
					uid={props.uid + "-item-" + lastItemId(datas) + 1} 
					sx={{
					}} 
					onFormSubmit={handleCreateFormSubmit}
					onColumnDelete={handleColumnDelete}
				/>
			}
		</Grid>
	);
}

function DashboardColumnForm(props: any)
{
	// Menu deroulant ?

	const [content, setContent] = useState(props.content || '');
	const [title, setTitle] = useState(props.title || '');
	const [subheader, setSubheader] = useState(props.subheader || '');
	const [size, setSize] = useState(6);
	const [label, setLabel] = useState('Subject')


	const [sizes] = useState([
		{
			value: 0,
			label: 'none',
		},
		{
			value: 3, 
			label: 'small',
		},
		{
			value: 4,
			label: 'medium',
		},
		{
			value: 6,
			label: 'large',
		},
		{
			value: 12,
			label: 'extra large',
		},
	]);

	const [subjects] = useState([
		{
			theme: "News",
			mode: 'Recent'
		},
		{
			theme: "News",
			mode: 'Popular',
		},
		{
			theme: "News",
			mode: 'Standard',
		},
		{
			theme: "Matches",
			mode: 'Recent'
		},
		{
			theme: "Matches",
			mode: 'Won',
		},
		{
			theme: "Matches",
			mode: 'Lost',
		},
		{
			theme: "Matches",
			mode: 'Null',
		},
		{
			theme: 'Matches',
			mode: 'All',
		},
		{
			theme: "Scores",
			mode: 'Recent'
		},
		{
			theme: "Scores",
			mode: 'Won',
		},
		{
			theme: "Scores",
			mode: 'Lost',
		},
		{
			theme: "Scores",
			mode: 'Null',
		},
		{
			theme: 'Scores',
			mode: 'All',
		},
		{
			theme: "Friends",
			mode: 'Recent'
		},
		{
			theme: "Friends",
			mode: 'Connected',
		},
		{
			theme: "Friends",
			mode: 'Off-line',
		},
		{
			theme: "Friends",
			mode: 'WaitingList',
		},
		{
			theme: 'Friends',
			mode: 'All',
		},
	]); // etc... just for testing the select input

	const submitText = props.title !== undefined ? 'Update' : 'Create';

	const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setContent(e.target.value);
	const handleXsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSize(parseInt(e.target.value));

	const handleSubmit = () => {
		title.length !== 0 && subheader.length !== 0 && content.length !== 0 &&
		props.onFormSubmit({
			items: [
				{
					title: title,
					subheader: subheader,
					content: content,
					customSx: {},
					key: props.uid
				},
			],
			key: props.colUid,
			xs: size,
			sx: {},
		} as IColumn);
	};
	
	return (
		<Card 
			key={props.uid} 
			sx={{
				...props.sx, 
				border: '5px dashed pink', 
				overflow: 'scroll',
				width: '50vw', 
				m: 'auto',
				position: 'absolute',
				left: '25vw',
				transition: 'position ease-in-out 4ms, height ease-in-out 4ms, margin ease-in-out 4ms'
			}}
			variant={'elevation'} 
			elevation={8}>
			<CardHeader 
				sx={{
					display: 'flex', 
					flexFlow: 'column', 
					justifyContent: 'center'
				}} 
			title={submitText}/>

			<CardContent 
				sx={{m: '5%'}}>
				<Autocomplete 
					id="subject"
					disableClearable
					options={subjects.sort()}
					groupBy={(option) => option.theme}
					getOptionLabel={(option) => (option.mode)}
					onChange={(e: any, val: any) => {
						console.log(val, val.theme, val.mode)
						setTitle(val.theme);
						setSubheader(val.mode);
						setLabel(val.theme)
					}}
					sx={{width: '100%'}}
					renderInput={(params) => <TextField {...params} variant="outlined" label={label}/>}
				 />
			</CardContent>
			<CardContent 
				sx={{m: '5%'}}>
				<TextField 
					sx={{width: '100%'}} 
					required 
					variant="outlined" 
					multiline={true} 
					label="Content" 
					placeholder={props.content} 
					onChange={handleContentChange} 
					value={content}/>
			</CardContent>

			<CardContent 
				sx={{m: '5%'}}>
				<TextField
					sx={{width: '50%'}} 
					required 
					select
					variant="outlined" 
					multiline={true} 
					label="Size"
					defaultValue={4}
					onChange={handleXsChange}
				>
					{
						sizes.map((size) => {return <MenuItem key={size.value} value={size.value}>{size.label}</MenuItem>})
					}
				</TextField>
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

	const handleItemOpen = () => setOpen(true);
	const handleFormClose = () => setOpen(false);

	const handleFormSubmit = (item: IColumn) => {
		console.log("ToggableDashboardColumnForm: ", item);
		props.onFormSubmit(item);
		setOpen(false);
	}

	const handleDashboardSettings = () => console.log("pas encore geré");

	return (
		<Grid xs={12} sx={{...props.sx, }}>
			{ 
				open
				? <DashboardColumnForm 
					uid={props.uid}
					colUid={props.colUid}
					onFormSubmit={handleFormSubmit}
					onFormClose={handleFormClose}
					sx={{}}
					/> 
				: 
				<React.Fragment>
				<Fab 
					aria-label='add-column'
					variant="circular"
					color='secondary' 
					onClick={handleItemOpen} 
					sx={{
					}}
				>
					<AddIcon/>
				</Fab>
				<Fab 
					aria-label='add-item' 
					variant="circular"
					onClick={handleDashboardSettings} 
					color="secondary"
					sx={{
					}}
				>
					<SettingsTwoToneIcon/>
				</Fab></React.Fragment>
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
			key: '',
			}],
		key: '',
		xs: 0,
		sx: {},
	} as IColumn]);

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

	const handleCreateColumnSubmit = (column: IColumn) => {
		console.log("Dashboard handleCreateColumnSubmit", column);
		if (datas[0].key.length !== 0) {
			setDatas([...datas, column]);
		}
		else
			setDatas([column]);
	};

	useEffect(() => setUser(props.user), [props.user]);
	useEffect(() => setDatas((datas) => [...datas]), []);
	
	const handleUpdateColumn = (item: Array<IItem>, colUid: String) => {

		console.log("Dashboard handleUpdateColumn: ", colUid, item);
		datas.map((data: IColumn) => {
			if (colUid === data.key)
			{
				data.items = item;
				if (item.length === 0)
					data.xs = 0;
				console.log("Dashboard handleUpdateColumn: ", data, item, colUid);
			}
			return item;
		});
		setDatas(datas.filter((data: IColumn) => data.xs !== 0));
	};
	const handleColumnDelete = (colUid: String) => setDatas(datas.filter((data) => data.key !== colUid));

	const lastColumnId = (datas: Array<IColumn>) => {return ((datas.length > 0) ? datas[datas.length - 1].key : 0);};
	const hasDatas = (datas: Array<IColumn>) => datas.length > 0 && datas[0].key.length !== 0 && datas[0].key !== undefined && datas[0].key !== null
	return (
		<Box component='div' sx={{width: '100%', height: '100%'}}>
			<Box component="h2" sx={{}}>Glad to see you, {user.name}!</Box>
			<Grid container xs={12} sx={{border: '1px solid black', display: 'flex', flexDirection: 'column-reverse'}}>
			{
				hasDatas(datas)	&&
				(
						datas.map((data: IColumn) => {
							return ( data.xs > 0 &&
								<DashboardColumn 
									key={data.key}
									uid={data.key}
									xs={data.xs} 
									children={data.items}
									onFormSubmit={handleUpdateColumn}
									onColumnDelete={handleColumnDelete}
								/>
							)
						})
				)
			}
			<ToggableDashboardColumnForm 
				uid={"item-" + 1 + lastColumnId(datas) + 1} 
				colUid={"col-" + ((datas.length === 1 && datas[0].key.length === 0) ? 1 : datas.length + 1)} 
				onFormSubmit={handleCreateColumnSubmit}
				creation={true}
				sx={{
					border: '7px solid teal',
					zIndex: 1000,
					display: 'flex',
					justifyContent: 'space-around',
				}}
			/>
			</Grid>
		</Box>
	);
}

export default Dashboard;