import { atom } from "jotai";
import {File} from "@/core/models/file.model.ts";

const initialSharedFiles = null;
export const SharedFilesAtom = atom<File[] | null>(initialSharedFiles);
