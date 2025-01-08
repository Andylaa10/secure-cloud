import {File} from "@/core/models/file.model.ts";
import {CheckCircle2Icon, DeleteIcon, DownloadCloudIcon, MoreHorizontal, ShareIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Row} from "@tanstack/react-table";
import {CryptoService} from "@/core/services/crypto-service.ts";
import {useAtom} from "jotai/index";
import {TokenAtom} from "@/core/atoms/token-atom.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {KeyCloakCustomUser} from "@/core/models/user.model.ts";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import ComboBoxUsers from "@/components/users-search/users-search.tsx";
import {UserAtom} from "@/core/atoms/user-atom.ts";
import {FileShareService} from "@/core/services/file-share-service.ts";
import {ShareFileDTO} from "@/core/dtos/shareFileDTO.ts";
import {downloadFile} from "@/utils/download-file.ts";
import {toast} from "@/hooks/use-toast.ts";
import {useEffect, useState} from "react";
import {FileService} from "@/core/services/file-service.ts";
import {MyFilesAtom} from "@/core/atoms/my-files-atom.ts";

type FileDropdownActionsProps = {
    row: Row<File>;
};

export default function FileDropdownActions({row}: FileDropdownActionsProps): JSX.Element {
    const cryptoService = new CryptoService();
    const fileShareService = new FileShareService();
    const fileService = new FileService();
    const keyCloakService = new KeycloakService();

    const [token] = useAtom(TokenAtom);
    const [user] = useAtom(UserAtom);
    const [myFiles, setMyFiles] = useAtom(MyFilesAtom);

    const [isSharedDialogOpen, setIsSharedDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [usersFromKeycloak, setUsersFromKeycloak] = useState<KeyCloakCustomUser[] | null>(null);
    const [selectedUser, setSelectedUser] = useState<KeyCloakCustomUser | null>(null);
    const [usernames, setUsernames] = useState<string[] | null>(null);
    const [sharedWithUsers, setSharedWithNames] = useState<KeyCloakCustomUser[] | null>(null);
    const [filterUsernames, setFilterUsernames] = useState<KeyCloakCustomUser[] | null>(null);

    const excludeUsers = ["admin", user.preferred_username!];

    const handleUserSelect = (user: KeyCloakCustomUser | null) => {
        setSelectedUser(user);
    };

    const handleRemoveUser = async (userId: string, fileId: string, username: string) => {
        try {
            await fileShareService.removeUserFromFile(userId, fileId, token);

            // Update shared users
            const updatedSharedWithUsers = sharedWithUsers?.filter(u => u.username !== username) || [];
            setSharedWithNames(updatedSharedWithUsers);

            // Update filtered usernames
            const updatedFilteredUsernames = usersFromKeycloak?.filter(
                u => !updatedSharedWithUsers.some(sharedUser => sharedUser.username === u.username) &&
                    !excludeUsers.includes(u.username)
            ) || [];
            setFilterUsernames(updatedFilteredUsernames);

            toast({
                title: "User removed successfully!",
                subTitle: `${username} no longer has access to the file.`,
            });
        } catch {
            toast({
                variant: "destructive",
                title: "Failed to remove user",
                subTitle: "An unexpected error occurred.",
            });
        }
    };

    const shareFile = async (fileId: string, key: string): Promise<void> => {
        try {
            const encryptedAesKey = await cryptoService.encryptAesKey(selectedUser!.attributes['publicKey'][0], key);

            const shareFileDTO: ShareFileDTO = {
                fileId: fileId,
                encryptedKey: encryptedAesKey,
                ownerDisplayName: user!.preferred_username,
                sharedWithUserId: selectedUser!.id,
                sharedWithUserDisplayName: selectedUser!.username,
            };

            await fileShareService.shareFile(shareFileDTO, token);

            toast({
                icon: <CheckCircle2Icon className="text-green-600"/>,
                title: "File is shared successfully!",
                subTitle: `${selectedUser!.username} can now access the file.`,
            });
        } catch (error) {
            console.error("Error sharing file:", error);
        }
        closeSharedDialog();
    };

    useEffect(() => {
        if (isSharedDialogOpen && !usersFromKeycloak) {
            keyCloakService.getAllUsers(token).then(users => {
                if (users) {
                    setUsersFromKeycloak(users);
                }
            });
        }
    }, [isSharedDialogOpen, usersFromKeycloak]);

    useEffect(() => {
        if (isSharedDialogOpen && usersFromKeycloak && usernames) {
            // Exclude users already on the file and in excludeUsers
            const filteredUsers = usersFromKeycloak.filter(
                u => !usernames.includes(u.username) && !excludeUsers.includes(u.username)
            );
            setFilterUsernames(filteredUsers);

            // Set shared users, excluding `admin` and `user.preferred_username`
            const sharedWithUsers = usersFromKeycloak.filter(
                u => usernames.includes(u.username) && !excludeUsers.includes(u.username)
            );
            setSharedWithNames(sharedWithUsers);
        }
    }, [isSharedDialogOpen, usersFromKeycloak, usernames]);

    const closeSharedDialog = () => {
        setIsSharedDialogOpen(false);
        setTimeout(() => {
            document.body.style.pointerEvents = "auto";
        }, 500);
    };

    const openShareDialog = async (id: string) => {
        setIsSharedDialogOpen(true);
        let usernamesOnFile = await fileShareService.getUsersOnSharedFile(id, token);
        usernamesOnFile = [...usernamesOnFile, ...excludeUsers];
        setUsernames(usernamesOnFile);
    };


    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setTimeout(() => {
            document.body.style.pointerEvents = 'auto';
        }, 500);
    };

    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await fileService.deleteFile(token, row.original.id);

            toast({
                icon: <CheckCircle2Icon className="text-red-600"/>,
                title: "File deleted successfully!",
                subTitle: `${row.original.name} has been removed.`,
            });

            const newFileList = myFiles?.filter(f => {
                return f.id !== row.original.id;
            });

            setMyFiles(newFileList!);
        } catch (error) {
            console.error("Error deleting file: ", error);
        } finally {
            closeDeleteDialog();
        }
    };

    return (
        <div>
            <AlertDialog open={isSharedDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader className="space-y-6">
                        <AlertDialogTitle>Share {row.original.name}</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="w-full flex flex-col space-y-4">
                                <ComboBoxUsers userList={filterUsernames} onUserSelect={handleUserSelect}/>
                                <div>
                                    <h1 className="text-lg font-semibold">Shared with</h1>
                                    {sharedWithUsers && (
                                        <div>
                                            {sharedWithUsers.length > 0 ? sharedWithUsers?.map((user, index) => (
                                                <div key={index}
                                                     className="flex justify-between items-center space-y-2">
                                                    <div className="flex items-center justify-between space-x-4">
                                                        <div
                                                            className="flex items-center justify-between rounded-full bg-[#5838FB] h-6 w-6">
                                                            <span className="flex items-center justify-center w-full h-full">{user.username[0]}</span>
                                                        </div>
                                                        <span>{user.username}</span>
                                                    </div>
                                                    <Button variant="destructive"
                                                            onClick={() => handleRemoveUser(user.id, row.original.id, user.username)}>
                                                    Remove <DeleteIcon/>
                                                    </Button>
                                                </div>
                                            )) : <div>This file is not shared with any users</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" disabled={!selectedUser}
                                onClick={async () => await shareFile(row.original.id, row.original.key!)}>Share</Button>
                        <AlertDialogAction
                            className="hover: select-none shadow-lg transform active:scale-75 transition-transform"
                            onClick={() => {
                                closeSharedDialog();
                            }}>
                            Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {row.original.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this file? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={closeDeleteDialog}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={async () => {
                        await openShareDialog(row.original.id);
                    }}
                                      className="w-full flex items-center justify-between">
                        <span>Share file</span>
                        <ShareIcon className="h-4 w-4"></ShareIcon>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                        await downloadFile(row.original.content as Uint8Array, row.original.name);
                    }} className="w-full flex items-center justify-between">
                        <span>Download file</span>
                        <DownloadCloudIcon className="h-4 w-4"></DownloadCloudIcon>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={async () => {
                        openDeleteDialog();
                    }} className="w-full flex items-center justify-between">
                        <span>Delete file</span>
                        <Trash2Icon className="h-4 w-4"></Trash2Icon>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
