import { ModelBase } from './ModelBase';


export interface UserInfo extends ModelBase {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}
