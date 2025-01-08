import {File} from "@/core/models/file.model.ts";
import {base64ToArrayBuffer} from "@/utils/base64-to-array-buffer.ts";
import {useAtom} from "jotai/index";
import {UserAtom} from "@/core/atoms/user-atom.ts";
import {CryptoService} from "@/core/services/crypto-service.ts";
import {FileShareService} from "@/core/services/file-share-service.ts";
import {TokenAtom} from "@/core/atoms/token-atom.ts";
import {RsaAtom} from "@/core/atoms/rsa-atom.ts";
import {shared_files_columns} from "@/components/shared-files-table/shares-files-column.tsx";
import {SharedFilesAtom} from "@/core/atoms/shared-files-atom.ts";
import {useEffect} from "react";
import FilesTable from "@/components/files-table/files-page.tsx";

export default function Shared() {
  const [sharedFiles, setSharedFiles] = useAtom(SharedFilesAtom);
  const [rsa] = useAtom(RsaAtom);
  const [user] = useAtom(UserAtom);
  const [token] = useAtom(TokenAtom);

  const cryptoService = new CryptoService();
  const fileShareService = new FileShareService();

  const handleGetFiles = async () => {
    const files = await fileShareService.getAllSharedFilesByUserId(user!.sub, token);
    if (!files || files.size === 0) return;

    try {
      const keyFiles = new Map<string, File>();
      for (const [key, value] of Object.entries(files)) {
        if(value.ownerId !== user!.sub) {
          const decryptedKey = await cryptoService.decryptAesKey(rsa, key);
          const encryptedFile = base64ToArrayBuffer(value.content);
          const iv = base64ToArrayBuffer(value.iv);
          const decryptedContent = await cryptoService.decryptFile(decryptedKey, encryptedFile, iv);
          keyFiles.set(decryptedKey, {...value, content: decryptedContent});
        }
      }

      const decryptedFiles: File[] = [];

      for (const value of keyFiles.values()) {
        decryptedFiles.push(value);
      }

      setSharedFiles(decryptedFiles);
    } catch (error) {
      console.error("Error decrypting files:", error);
    }
  }
  useEffect(() => {
    if (user) {
      handleGetFiles();
    }
  }, []);
  return (
      <div>
        <div className="container mx-auto py-10">
          {sharedFiles && (
              <FilesTable columns={shared_files_columns} data={sharedFiles}/>
          )}
        </div>
      </div>
  )
}
