import { atom } from "jotai";
import { User} from "src/core/models/user.model"
const initialUser = null

export const UserAtom = atom<User | null>(initialUser);