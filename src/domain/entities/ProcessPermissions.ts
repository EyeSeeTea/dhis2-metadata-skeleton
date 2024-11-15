import { UserGroup } from '../entities/UserGroups';
import { User } from '../entities/Users';

export interface ProcessPermissions {
    userGroups: UserGroup[];
    users: User[];
}