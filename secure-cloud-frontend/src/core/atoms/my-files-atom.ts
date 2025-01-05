import { atom } from "jotai";
import {File} from "@/core/models/file.model.ts";

const initialMyFiles = null;
export const MyFilesAtom = atom<File[] | null>(initialMyFiles);
