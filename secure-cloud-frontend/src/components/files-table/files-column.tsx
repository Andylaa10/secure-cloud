import {ColumnDef} from "@tanstack/react-table";
import {DownloadCloudIcon, MoreHorizontal, PenIcon, ShareIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {File} from "@/core/models/file.model.ts";
import {CryptoService} from "@/core/services/crypto-service.ts";

// const downloadFile = async (aesKey: string, encryptedFile: Uint8Array, iv: Uint8Array, name: string): Promise<void> => {
//     try {
//         const cryptoService = new CryptoService();
//         const content = await cryptoService.decryptFile(aesKey, encryptedFile, iv);
//
//         // Log the decrypted content as raw bytes
//         console.log('Decrypted content (Uint8Array):', content);
//         console.log('Decrypted content length:', content.length);
//
//         if (content.length === 0) {
//             console.error('Decrypted content is empty!');
//             return;
//         }
//
//         const contentToDownload = new Blob([content], { type: 'application/octet-stream' });
//
//         // Trigger the download with the appropriate file extension
//         const url = URL.createObjectURL(contentToDownload);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = name || 'download';  // Ensure default file name if not provided
//         a.click();
//
//         // Clean up the object URL after download
//         URL.revokeObjectURL(url);
//
//
//         async function testEncryptionDecryption() {
//             const aesKey = await cryptoService.generateAesKey();
//             const fileData = new TextEncoder().encode('Hello, World!').buffer;
//
//             // Encrypt the file
//             const { encryptedFile, ivBytes } = await cryptoService.encryptFile(aesKey, fileData);
//
//             // Decrypt the file
//             try {
//                 const decryptedData = await cryptoService.decryptFile(aesKey, encryptedFile, ivBytes);
//                 console.log('Decrypted Data:', new TextDecoder().decode(decryptedData));
//             } catch (error) {
//                 console.error('Decryption error:', error);
//             }
//         }
//
//         testEncryptionDecryption();
//     } catch (error) {
//         console.error('File download error:', error);
//     }
// };
const downloadFile = async (aesKey: string, encryptedFile: Uint8Array, iv: Uint8Array, name: string): Promise<void> => {
    try {
        const cryptoService = new CryptoService();

        // Step 1: Decrypt the file
        const content = await cryptoService.decryptFile(aesKey, encryptedFile, iv);

        // Log the decrypted content to verify
        console.log('Decrypted content (Uint8Array):', content);
        console.log('Decrypted content length:', content.length);

        if (content.length === 0) {
            console.error('Decrypted content is empty!');
            return;
        }

        // Step 2: Create a Blob from the decrypted binary content
        const contentToDownload = new Blob([content], { type: 'application/octet-stream' });

        // Step 3: Trigger the download with the appropriate file name
        const url = URL.createObjectURL(contentToDownload);
        const a = document.createElement('a');
        a.href = url;
        a.download = name || 'download';  // Default file name if not provided
        a.click();

        // Clean up the object URL after download
        URL.revokeObjectURL(url);

        async function testEncryptionDecryption() {
            const aesKey = await cryptoService.generateAesKey();
            const fileData = new TextEncoder().encode('Hello, World!').buffer;

            // Encrypt the file
            const { encryptedFile, ivBytes } = await cryptoService.encryptFile(aesKey, fileData);

            // Decrypt the file
            try {
                const decryptedData = await cryptoService.decryptFile(aesKey, encryptedFile, ivBytes);
                console.log('Decrypted Data:', new TextDecoder().decode(decryptedData));
            } catch (error) {
                console.error('Decryption error:', error);
            }
        }

        testEncryptionDecryption();

    } catch (error) {
        console.error('File download error:', error);
    }
};



export const columns: ColumnDef<File>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "ownerDisplayName",
        header: "Owner Name",
    },
    {
        accessorKey: "ownerId",
        header: "Owner Id",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            const formattedDate = date.toISOString().split("T")[0];
            const time = date.toTimeString().split(" ")[0];
            return `${formattedDate} ${time}`;
        },
    },
    {
        accessorKey: "contentType",
        header: "Content Type",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="w-full flex items-center justify-between">
                            <span>Share file</span>
                            <ShareIcon className="h-4 w-4"></ShareIcon>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={async ()=> {
                            await downloadFile(row.original.key, row.original.content, row.original.iv, row.original.name);
                        }} className="w-full flex items-center justify-between">
                            <span>Download file</span>
                            <DownloadCloudIcon className="h-4 w-4"></DownloadCloudIcon>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="w-full flex items-center justify-between">
                            <span>Update file</span>
                            <PenIcon className="h-4 w-4"></PenIcon>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="w-full flex items-center justify-between">
                            <span>Delete file</span>
                            <Trash2Icon className="h-4 w-4"></Trash2Icon>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
];
