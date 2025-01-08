import {DataTable} from "@/components/ui/data-table.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {File} from "@/core/models/file.model.ts";

interface FileTableProps {
    data: File[];
    columns: ColumnDef<File>[];
}
export default function FilesTable({data, columns}: FileTableProps): JSX.Element {
    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}
