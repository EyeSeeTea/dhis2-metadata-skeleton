import { UserGroup } from "./UserGroups";
import { User } from "./Users";

export interface ProcessedPermissions {
    userGroups: UserGroup[];
    users: User[];
}
