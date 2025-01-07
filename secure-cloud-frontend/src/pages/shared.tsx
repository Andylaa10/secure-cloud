import { Button } from "@/components/ui/button"
import {File} from "@/core/models/file.model.ts";
import {base64ToArrayBuffer} from "@/utils/base64-to-array-buffer.ts";
import React, {useEffect} from "react";
import {useAtom} from "jotai/index";
import {UserAtom} from "@/core/atoms/user-atom.ts";
import {CryptoService} from "@/core/services/crypto-service.ts";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {FileService} from "@/core/services/file-service.ts";
import {FileShareService} from "@/core/services/file-share-service.ts";
import {MyFilesAtom} from "@/core/atoms/my-files-atom.ts";
import {TokenAtom} from "@/core/atoms/token-atom.ts";
import {RsaAtom} from "@/core/atoms/rsa-atom.ts";
import MyFilesTable from "@/components/files-table/files-page.tsx";
import {shared_files_columns} from "@/components/shared-files-table/shares-files-column.tsx";

export default function Shared() {
    const [myFiles, setMyFiles] = useAtom(MyFilesAtom);
    const [rsa] = useAtom(RsaAtom);
    const [user] = useAtom(UserAtom);
    const [token] = useAtom(TokenAtom);

    const cryptoService = new CryptoService();
    const keyCloakService = new KeycloakService();
    const fileService = new FileService();
    const fileShareService = new FileShareService();

    const handleGetFiles = async () => {
        const files = await fileShareService.getAllSharedFilesByUserId(user!.sub, token);
        if (!files || files.size === 0) return;

        try {
            const keyFiles = new Map<string, File>();
            for (const [key, value] of Object.entries(files)) {
                console.log('Encrypted AES Key:', key);
                const decryptedKey = await cryptoService.decryptAesKey(rsa, key);
                console.log('Decrypted AES Key:', decryptedKey);

                const encryptedFile = base64ToArrayBuffer(value.content as string);
                console.log('Received Encrypted File (Base64):', value.content);

                const iv = base64ToArrayBuffer(value.iv);
                console.log('IV during decryption:', iv);

                const decryptedContent = await cryptoService.decryptFile(decryptedKey, encryptedFile, iv);
                console.log('Decrypted Content:', decryptedContent);

                keyFiles.set(decryptedKey, { ...value, content: decryptedContent });
            }

            const decryptedFiles: File[] = [];

            for (const value of keyFiles.values()) {
                decryptedFiles.push(value);
            }


            setMyFiles(decryptedFiles);
        } catch (error) {
            console.error("Error decrypting files:", error);
        }
    }
    useEffect(() => {
        if(user) {
            handleGetFiles();
        }
    }, []);
    return (
        <div>
            <div className="container mx-auto py-10">
                {myFiles && (
                    <MyFilesTable columns={shared_files_columns} data={myFiles}/>
                )}
            </div>
        </div>
    )
}
