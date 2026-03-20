export interface DbUserRecord {
  id: string;
  twitchId: string;
  twitchUsername: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTaskRecord {
  id: string;
  userId: string;
  text: string;
  doneAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTaskWithUserRecord extends DbTaskRecord {
  user: DbUserRecord;
}

export interface TaskOverlayUser {
  id: string;
  displayName: string;
  twitchUsername: string;
}

export interface TaskOverlayItem {
  displayNumber: number;
  id: string;
  text: string;
  createdAt: string;
  user: TaskOverlayUser;
}

export interface TaskOverlayGroup {
  user: TaskOverlayUser;
  tasks: TaskOverlayItem[];
}

export interface TasksOverlayResponse {
  tasks: TaskOverlayItem[];
  groups: TaskOverlayGroup[];
  updatedAt: string;
}
