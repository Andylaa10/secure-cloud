import {ColumnDef} from "@tanstack/react-table";
import {File} from "@/core/models/file.model.ts";
import {DownloadCloudIcon} from "lucide-react";

const downloadFile = async (content: Uint8Array, name: string): Promise<void> => {
    try {

        const contentToDownload = new Blob([content], {type: 'application/octet-stream'});

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

export const shared_files_columns: ColumnDef<File>[] = [
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
        cell: ({row}) => {
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
        cell: ({row}) => {
            return (<DownloadCloudIcon className="h-4 w-4 cursor-pointer"  onClick={async ()=> {
                await downloadFile(row.original.content as Uint8Array, row.original.name);
            }}/>)
        },
    },
];
