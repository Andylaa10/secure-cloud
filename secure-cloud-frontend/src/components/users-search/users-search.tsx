import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { KeyCloakCustomUser } from "@/core/models/user.model.ts"

type ComboBoxUserProps = {
    userList: KeyCloakCustomUser[] | null;
    onUserSelect: (selectedUser: KeyCloakCustomUser | null) => void;
}

export default function ComboBoxUsers({ userList, onUserSelect }: ComboBoxUserProps): JSX.Element {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const filteredUsers = userList
        ? userList.filter((user) =>
            user.username.toLowerCase().includes(value.toLowerCase())
        )
        : [];

    const handleSelect = (username: string) => {
        const selectedUser = userList?.find((user) => user.username === username) || null;
        setValue(username);
        setOpen(false);
        onUserSelect(selectedUser);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value && userList
                        ? userList.find((u) => u.username === value)?.username
                        : "Select user..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search user..."
                        className="h-9 z-50"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <CommandList>
                        {filteredUsers.length === 0 ? (
                            <CommandEmpty>No user found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {filteredUsers.map((u) => (
                                    <CommandItem
                                        key={u.username}
                                        value={u.username}
                                        onSelect={handleSelect}
                                    >
                                        {u.username}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === u.username ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
