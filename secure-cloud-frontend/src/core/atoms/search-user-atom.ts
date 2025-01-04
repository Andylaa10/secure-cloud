import { atom } from "jotai";
import { User} from "src/core/models/user.model"
const initialSearchUser = null;

export const SearchUserAtom = atom<User | null>(initialSearchUser);
