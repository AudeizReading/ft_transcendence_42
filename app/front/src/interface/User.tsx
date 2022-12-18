export interface NotifDataType { /* also in back */
  text: string;
  date: string;
  url?: string | null;
  read: boolean;
  type: string;
}

export interface NotifContainerType { /* also in back */
  num: number;
  arr: Array<NotifDataType>
}

export interface User {
  id: number;
  name: string;
  connected: boolean;
  matchmaking_state: string | null; // or null
  matchmaking_remaining: string | null; // or null
  matchmaking_users: {
    count: number;
    avatars: {
      name: string;
      avatar: string;
    }[];
  };
  avatar: string;
  notifs: NotifContainerType;
  msgs: NotifContainerType;
  actions: NotifContainerType;
  is_playing: boolean;
}