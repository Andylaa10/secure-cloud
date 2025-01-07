import {File} from "@/core/models/file.model.ts";
import {DownloadCloudIcon, MoreHorizontal, PenIcon, ShareIcon, Trash2Icon} from "lucide-react";
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
import {FileService} from "@/core/services/file-service.ts";
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
import {useEffect, useState} from "react";
import {KeyCloakCustomUser} from "@/core/models/user.model.ts";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import ComboBoxUsers from "@/components/users-search/users-search.tsx";
import {UploadFileDTO} from "@/core/dtos/uploadFileDTO.ts";
import {arrayBufferToBase64} from "@/utils/array-buffer-to-base64.ts";
import {UserAtom} from "@/core/atoms/user-atom.ts";
import {FileShareService} from "@/core/services/file-share-service.ts";
import {ShareFileDTO} from "@/core/dtos/shareFileDTO.ts";

type FileDropdownActionsProps = {
    row: Row<File>;
};

export default function FileDropdownActions({row}: FileDropdownActionsProps): JSX.Element {
    const cryptoService = new CryptoService();
    const fileShareService = new FileShareService();
    const keyCloakService = new KeycloakService();

    const [token] = useAtom(TokenAtom);
    const [user] = useAtom(UserAtom);
    const [isSharedDialogOpen, setIsSharedDialogOpen] = useState(false);
    const [searchUsers, setSearchUsers] = useState<KeyCloakCustomUser[] | null>(null);
    const [selectedUser, setSelectedUser] = useState<KeyCloakCustomUser | null>(null);

    const handleUserSelect = (user: KeyCloakCustomUser | null) => {
        setSelectedUser(user);
    };

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

    const shareFile = async (fileId: string): Promise<void> => {
        try {
            const aesKey = await cryptoService.generateAesKey();
            //Cannot go in here if a user is not selected
            console.log(selectedUser!.attributes['publicKey'][0])
            const encryptedAesKey = await cryptoService.encryptAesKey(selectedUser!.attributes['publicKey'][0], aesKey);

            const shareFileDTO: ShareFileDTO = {
                fileId: fileId,
                encryptedKey: encryptedAesKey,
                OwnerDisplayName: user!.preferred_username,
                sharedWithUserId: selectedUser!.id,
            };

            await fileShareService.shareFile(shareFileDTO, token)
        }
        catch (error) {
            console.error('Error sharing file: ', error);
        }
        closeSharedDialog();
    };

    useEffect(() => {
        if (isSharedDialogOpen && !searchUsers) {
            keyCloakService.getAllUsers(token).then(users => {
                if (users) {
                    const filteredUsers = users.filter(
                        u => u.username !== 'admin' && u.username !== user!.preferred_username
                    );
                    setSearchUsers(filteredUsers);
                }
            });
        }
    }, [isSharedDialogOpen, searchUsers, token]);

    const closeSharedDialog = () => {
        setIsSharedDialogOpen(false);
        setTimeout(()=> {
            document.body.style.pointerEvents = 'auto';
        },500);
    }

    return (
        <div>
            <AlertDialog open={isSharedDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Share {row.original.name}</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="w-full">
                                <ComboBoxUsers userList={searchUsers} onUserSelect={handleUserSelect}  />
                            </div>
                        </AlertDialogDescription>

                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" disabled={!selectedUser} onClick={async () => await shareFile(row.original.id)}>Share</Button>
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsSharedDialogOpen(true)}
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
        </div>
    )
}
