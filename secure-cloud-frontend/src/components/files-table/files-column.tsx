import {ColumnDef} from "@tanstack/react-table";
import {MoreHorizontal, PenIcon, ShareIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {File} from "@/core/models/file.model.ts";

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
