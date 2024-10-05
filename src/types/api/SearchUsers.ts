import { User } from 'types/resources/User';

export interface SearchUsers {
  total_count: number;
  incomplete_results: boolean;
  items: User[];
}
