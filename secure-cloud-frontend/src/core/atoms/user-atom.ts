import { atom } from "jotai";
import { KeyCloakUser} from "src/core/models/user.model"
const initialUser = null;

export const UserAtom = atom<KeyCloakUser | null>(initialUser);
