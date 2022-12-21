import Box from '@mui/material/Box';

function Footer()
{
	const sx_footer = {
		position: "fixed",
		height: '40px',
		textAlign: "center",
		mx: '50%'
	};

	return (
		<Box component="footer" sx={sx_footer}>
		Powered by someone.
		</Box>);
}
export default Footer;