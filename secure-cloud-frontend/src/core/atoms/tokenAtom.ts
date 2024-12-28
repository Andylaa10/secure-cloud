import {atom} from "jotai";

const initialToken = "";

export const TokenAtom = atom<string>(initialToken);