export enum UpdateChannelOperator {
	ADD_USER,
	REMOVE_USER,
	BAN_USER,
	MUTE_USER,
	CHANGE_PASSWORD,
	ADD_ADMIN,
	REMOVE_ADMIN,
	REVOKE_BAN,
	REVOKE_MUTE
}

export class UpdateChannelDto {
	operation: UpdateChannelOperator;
	parameter: any;
	parameter_2: Date;
}