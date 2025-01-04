import { atom } from "jotai";

const initialMyFiles = null;
export const MyFilesAtom = atom<File[] | null>(initialMyFiles);
