import {columns} from "@/components/files-table/files-column.tsx";
import {DataTable} from "@/components/ui/data-table.tsx";

interface TableProps {
    data: Map<string, File>;
}
export default function MyFilesTable({data}: TableProps): JSX.Element {
    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}
