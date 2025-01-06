import {Button} from "@/components/ui/button"
import {UpdateUserDTO} from "@/core/dtos/updateUserDTO.ts";
import React, {useEffect, useRef, useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {useAtom} from "jotai";
import {UserAtom} from "@/core/atoms/user-atom.ts";
import {CryptoService} from "@/core/services/crypto-service.ts";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {TokenAtom} from "@/core/atoms/token-atom.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form"
import {CopyIcon, EyeIcon, EyeOffIcon, FolderPlusIcon} from "lucide-react";
import {Toaster} from "@/components/ui/toaster.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {FileService} from "@/core/services/file-service.ts";
import {UploadFileDTO} from "@/core/dtos/uploadFileDTO.ts";
import {MyFilesAtom} from "@/core/atoms/my-files-atom.ts";
import MyFilesTable from "@/components/files-table/files-page.tsx";

export default function Home() {
    const [token] = useAtom(TokenAtom);
    const [user] = useAtom(UserAtom);
    const [pk, setPk] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const cryptoService = new CryptoService();
    const keyCloakService = new KeycloakService();
    const {toast} = useToast();
    const [showPassword, setShowPassword] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileService = new FileService();
    const [publicKey, setPublicKey] = useState<string | null>(null);
    //const [searchUser] = useAtom(SearchUserAtom);
    const [myFiles, setMyFiles] = useAtom(MyFilesAtom);

    useEffect(() => {
        const handleKeyPair = async () => {
            if (user) {
                const test = await keyCloakService.getUserByUsername(user.preferred_username, token);
                if (!test[0]['attributes']) {
                    const {publicKeyPem, privateKeyPem} = await cryptoService.generateKeyPair();

                    const dto: UpdateUserDTO = {
                        email: user.email,
                        username: user.preferred_username,
                        firstName: user.given_name,
                        lastName: user.family_name,
                        publicKey: publicKeyPem,
                    }
                    setPublicKey(publicKeyPem);
                    await keyCloakService.updateUserPublicKey(token, test[0].id, dto);
                    setPk(privateKeyPem);
                    setIsDialogOpen(true);
                } else {
                    setPublicKey(test[0]['attributes']['publicKey'][0]);
                    console.log(test[0]['attributes']['publicKey'][0]);
                }
            }
        }

        if (user) {
            handleKeyPair();
        }
        console.log(user)
    }, [user]);

    const FormSchema = z.object({
        pk: z.string().nonempty("This field is required"),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        defaultValues: {
            pk: '',
        },
        resolver: zodResolver(FormSchema),
    });

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
        const uint8Array = new Uint8Array(buffer);
        let binary = '';
        uint8Array.forEach(byte => binary += String.fromCharCode(byte));
        return window.btoa(binary);
    }

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>, key?: string) {
        const file = event.target.files?.[0];

        if (!file) return;

        const fileData = await file.arrayBuffer();

        setSelectedFile(file);

        if (user?.sub === undefined) return;

        try {
            const aesKey = await cryptoService.generateAesKey();

            const { encryptedFile, ivBytes } = await cryptoService.encryptFile(aesKey, fileData);

            const encryptedAesKey = await cryptoService.encryptAesKey(publicKey!, aesKey);

            const dto: UploadFileDTO = {
                ownerDisplayName: user.preferred_username,
                name: file.name,
                content: arrayBufferToBase64(encryptedFile),
                contentType: file.name.split(".").pop() ?? "unknown",
                key: encryptedAesKey,
                ownerId: user?.sub,
                iv: arrayBufferToBase64(ivBytes)
            };

            // Step 6: Upload the file
            await fileService.uploadFile(token, dto);
        } catch (error) {
            console.error("Error during file upload:", error);
            throw error;
        } finally {
            setIsUploadDialogOpen(false);
            setSelectedFile(null);
        }
    }

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        if (pk) {
            setIsDialogOpen(true);
            form.setValue('pk', pk);
        }
    }, [pk, form]);

    useEffect(() => {
        // https://viewerjs.org/instructions/ TODO
        const handleGetFiles = async () => {
            const files = await fileService.getAllFilesByOwnerId(token);

            if (!files || files.length === 0) return;

            // TODO Need an Atom that holds our private key (change this to match the real public key)
            const pk = "-----BEGIN RSA PRIVATE KEY-----\n" +
                "MIIEowIBAAKCAQEAtOTRgEeOT4MkFazOM7+9we6DuanZLFNwspmFmJTvrCqV90q/\n" +
                "a1rSdwFegsA+TaIIYRuQMAhAGwhJ4fbJLShfHbijVFc2qFA8D6bEsNBUHywDdca2\n" +
                "LKiKCYQlc+eP/ZeVTm7+qkHvxPMwFgT65rYSCHaHT96ealxzYERw+6Acgc2QkZng\n" +
                "06JPWw6WswJUczZWrvh+7uG26UyVVVU58pkdcy8U4Gfmmgw5ZBq3Rq2AZAUA8kLa\n" +
                "Il1FT20Eq8j74uqxQhreKKlVfwtv7ssGxusDZCpabgDB3uA1Ih91ASHOuDkYwDr+\n" +
                "N4D3GnlTQy/usbyyDjYerwHI5w+EB2JFZFIH6QIDAQABAoIBAQCXTJeKAs+d46Mn\n" +
                "2exyThqJ/VQB03VI5NVrHIsoLtI0Hz5lowht434LeYKyO9cgmbkGd8Zm1k/ADHO3\n" +
                "YvGrKow70LYTkgquRsWllagH94eUtvyB4t12htVF1lh5FCJUShfgjWfFwfaotXrv\n" +
                "v+SXWYvFtlXA0QORFJiP2U7it22AhqY71Ma1Oq0/WOqz898cR92RGdMisTeajCnu\n" +
                "KcHRdp7O7lx3DSpx8AX9hl/3L2q99eh5yU8RjV4ue5hkNN2UH8TwmFF2tVZ70P3C\n" +
                "cDTV3HrhF1PTdUlMeMlp90p4mRB1UMLODyvOu17qO7fWQGe4pwTg2WdZSkPYyqJC\n" +
                "DqaktloBAoGBANetYK7cF6NRBS4bvYiN+5CcNFkkvxSvo3tOynS620mxXNZsOfKp\n" +
                "yhBzd+IUtAElP0g2qPKQ0amt+rCHbEYdmSwmdq9sTM/KbCyarI2dyDPnKso5w2gJ\n" +
                "ZdrKIYR8kzWpJrJl+qkTNf9ygTVE+QBqA3d/RS/Ee51guQOmzjra4rXBAoGBANa2\n" +
                "p9vofNdXeTWkyVQiqFV81c81wnjF7ZWD0FMW9q+udldBcFyQ1DVdbr9xdwUTAk+7\n" +
                "oCPZIQPp2I50rOFxP2Au6Nu+yBKbPeKwjrsdG805pvpxqr+C2fVNzYaPQQsazqSo\n" +
                "xIns6YFpbBV75QiICfE40zOVlCIpHz4njNwVtewpAoGATMpYUCng6K8iLwaFdydG\n" +
                "WHilUs/4kL7wcCjfgKw/A3/41Ad4omO9pBnYp1BDvtyqKWX8xVC2tblSNqQg8t36\n" +
                "+XNAcrkWqC0kUsVHhqyU6ZX28EWcw2AFOd8aC/fm2gY91urkUmqaoTb9th+2oGUe\n" +
                "kt9nnNhSQvh7J0euydnBOoECgYAf26I0Yt6DJRt69iRZM3s+k/M1d4iPWu7RjGlQ\n" +
                "qsuXbY9pivAdC/AwqthP14oNWrCxG+m65/CaIAxdtrogCSmaH9u1Hy2YdShNhlzn\n" +
                "Ln59iNxZtJvdJpEocI7aNE82Upfunovq2xgad4Xt+iAVj/nJrODJepwsJWXZVwzz\n" +
                "atU/YQKBgEEqHDBgAaWrJUeTRc2arbJgO9F7+2K99qoK46IvdeCgvHHwE6ClZX/h\n" +
                "EhSJC5coA9g0pab+ASZ7lyGt8ce2SYmJkZ/e0XTQQlFqoxPhcVfjpR+Bpd6iZhPu\n" +
                "rUzXoDER1Wm3jnlGvDNvQFMuW/cQyzOrwBanPlfSGrvDLl5PTErZ\n" +
                "-----END RSA PRIVATE KEY-----\n"

            try {
                const decryptedFiles = await Promise.all(
                    files.map(async (f) => {
                        const decryptedKey = await cryptoService.decryptAesKey(pk, f.key);
                        return {...f, key: decryptedKey};
                    })
                );

                setMyFiles(decryptedFiles);
            } catch (error) {
                console.error("Error decrypting files:", error);
            }
        }

        if (token && !myFiles) {
            handleGetFiles();
        }

    }, [token, myFiles]);

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(pk);
            console.log('Private key copied to clipboard');
            toast({
                title: "Copied!",
            })
        } catch (err) {
            console.error('Failed to copy private key:', err);
        }
    }


    function togglePassword() {
        const textArea = document.getElementById('pk-area') as HTMLTextAreaElement;
        setShowPassword(!showPassword);

        if (showPassword) {
            textArea.classList.remove('blur')
        } else {
            textArea.classList.add('blur');
        }
    }

    return (
        <div>
            <Button
                size="lg"
                className="select-none shadow-lg transform active:scale-75 transition-transform"
                onClick={() => setIsUploadDialogOpen(true)}
            >
                <FolderPlusIcon/>
                Upload a file
            </Button>

            <div className="container mx-auto py-10">
                {myFiles && (
                    <MyFilesTable data={myFiles}/>
                )}
            </div>

            <AlertDialog open={isUploadDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Upload Your File</AlertDialogTitle>
                        {!selectedFile && (
                            <AlertDialogDescription>
                                Select a file to upload from your device.
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>

                    {selectedFile && (
                        <p className="text-sm text-gray-500">
                            Selected file: {selectedFile.name}
                        </p>
                    )}

                    <AlertDialogFooter>
                        <Input
                            id="file"
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline"
                                className="select-none shadow-lg transform active:scale-75 transition-transform"
                                onClick={triggerFileInput}
                        >
                            <Label>Choose file</Label> {/*TODO Fix the button only clicking on the label works*/}
                        </Button>

                        <AlertDialogAction
                            className="hover: select-none shadow-lg transform active:scale-75 transition-transform"
                            onClick={() => {
                                setIsUploadDialogOpen(false)
                                setSelectedFile(null)
                            }}>
                            Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>THIS KEY CANNOT BE SHARED AND NEEDS TO BE SAVED IN A SECURE
                            PLACE</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <Form {...form}>
                                    <form>
                                        <div className="w-full">
                                            <FormField
                                                control={form.control}
                                                name="pk"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Private Key</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                id="pk-area"
                                                                placeholder="Your private key"
                                                                className="h-[630px] resize-none break-words blur"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            size="icon"
                            className="select-none"
                            onClick={() => togglePassword()}
                        >
                            {showPassword
                                ?
                                (<EyeOffIcon className="select-none"/>)
                                :
                                (<EyeIcon className="select-none"/>)}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                        >
                            <CopyIcon/>
                        </Button>
                        <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                <Toaster/>
            </AlertDialog>
        </div>
    )
}
