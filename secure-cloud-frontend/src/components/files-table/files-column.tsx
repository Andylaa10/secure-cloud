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
import {SharedFileService} from "@/core/services/shared-file-service.ts";

function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);  // Decode Base64 to binary string
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }

    return byteArray;
}

const downloadFile = async (aesKey: string, encryptedFileBase64: string, encryptedIV: string, name: string): Promise<void> => {
    try {

        const encryptedFile = base64ToArrayBuffer(encryptedFileBase64);
        const iv = base64ToArrayBuffer(encryptedIV);
        const cryptoService = new CryptoService();
        const content = await cryptoService.decryptFile(aesKey, encryptedFile, iv);

        if (content.length === 0) {
            console.error('Decrypted content is empty!');
            return;
        }

        const contentToDownload = new Blob([content], { type: 'application/octet-stream' });

        const url = URL.createObjectURL(contentToDownload);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('File download error:', error);
    }
};

const shareFile = async (): Promise<void> => {
    try {
        // TODO WORK IN PROGRESS
        const sharedFileService = new SharedFileService();

        await sharedFileService.shareFile({
            fileId: 'fileId',
            userId: 'userId',
        });
    }
    catch (error) {
        console.error('Error sharing file: ', error);
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
                        <DropdownMenuItem onClick={async () => {
                            await shareFile();
                        }} className="w-full flex items-center justify-between">
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
