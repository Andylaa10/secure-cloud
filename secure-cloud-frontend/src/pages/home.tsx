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

    // Convert Uint8Array to base64
    function arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return btoa(binary);
    }

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>, key?: string) {
        const file = event.target.files?.[0];

        if (!file) return;

        // Step 1: Read the file data
        const fileData = await file.arrayBuffer();
        const fileDataString = new TextDecoder().decode(fileData);

        setSelectedFile(file);

        if (user?.sub === undefined) return;

        try {
            // Step 2: Generate AES key
            const aesKey = await cryptoService.generateAesKey();
            console.log(aesKey, "aesKey");

            // Step 3: Encrypt the file with AES key
            const {encryptedFile, iv} = await cryptoService.encryptFile(aesKey, fileDataString);

            // Step 4: Encrypt the AES key with the public key from the parameters
            const s = publicKey;

            const encryptedAesKey = await cryptoService.encryptAesKey(//TODO Fix how to get the public key from the parameters
                s!
                , aesKey);

            const base64Content = arrayBufferToBase64(encryptedFile);

            const dto: UploadFileDTO = {
                ownerDisplayName: user.preferred_username,
                name: file.name,
                content: base64Content,
                contentType: file.name.split(".").pop() ?? "unknown",
                key: encryptedAesKey,
                ownerId: user?.sub,
                iv: iv
            }

            await fileService.uploadFile(token, dto)
        } catch (error) {
            console.error(error);
            throw error;
        }

        setIsUploadDialogOpen(false);
        setSelectedFile(null);
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
                "MIIEogIBAAKCAQEAh854MexWXUm8vWWKOQ8FhkVJnH4hAWAHkljm11EY7EYTp3ef\n" +
                "zICrRVMBi43E8/08qp9ujXAGi9AlhtthaB49fXXZ2iwInx4jb2b56uoP9nZdj/7J\n" +
                "ZV3Nrt2N+Egpu/7hHN9ZBtFP6g55AwY6BTv4oyNh1d2t0yz/ftfQVP/T2fb9r4oM\n" +
                "WpS2LCF1nNjk0HTVMcJeXpHB2dWvVm+KBDWS/evdWWJVb20dDUOWB35VMUyUFAu7\n" +
                "5vSNS+aMQTOJ1B4v/cY02LSPMrR65qzlq1/hpI5iLIFAo3BAmdB0rA63UdAUp8FU\n" +
                "DBTWR0mdIOFmyMZ1uGHttV1shRln/6jv8V369wIDAQABAoIBAHYDtzFy9k4VAN35\n" +
                "OheBdUSMO36xoI7oW0wS028y+xx/fR7fdk8pVSxmCIa0SP3aB3kiGNjyC849sA6z\n" +
                "376x4K+A1TKhZ1CWySZK70zz37FGhOHYAD2FOXMG9xNV6maDBC6p7FxfUjnMH96/\n" +
                "73WS+usRmThXbnF/vfsFIfZrZjcXAJTyb4ixa4KeEreDYJ1nzGUfZ4pLPdGpldar\n" +
                "28HdSMGpZwciBzZL+/M07NOUf1Nv1EODed93Z4jUd00FiBUdAh54CjwJ1iMl8sEo\n" +
                "1qSeibCZvl6D9EDbdGLhpvNz4lf/gEZ5F9aQgWtHuooq66EHG6LuOW27/9BCILpc\n" +
                "a9pNFakCgYEA4jQqYU6fCWp/Vxy4snOlOmtxudFJ2hWnHNADhtkx/JQPeaCemKsl\n" +
                "gk1px+FGtjMVGEW6o0F4Jldf4Dzn2/VT+LI4gwB8vKv23A30lX/R4WO38eze2Nq9\n" +
                "5kiJ6sU/cixXT/UejdJlqDlTdAa7Xfizyt6OzxGdC1eE9wtnnIqpNbMCgYEAmbIC\n" +
                "782WAmWOxCobdVTW3E3yQsanGO8gT8ov0je8JO4/6GRYtSn/jli6vVJnDuYODuW0\n" +
                "tvtYb9q6jb/HFkQRhB+DrS2n7LgkMcbz5FpxMxVJiRLkrp0uVv+j1u3U692JmMRy\n" +
                "v1KJPvKz4Zg9A6XtmQ38gkYICI044XkbYbpyC60CgYBheZs9nVSZCSRglIbel0j/\n" +
                "GKfEK/TIHoaJuvWaGWQZ9G+KuPU+0plyQguwT1paTz7q27lmemLdGs+84GIFff02\n" +
                "cQ47HW2jG/Nftj/MYG0/0+nDPZB2ICSu5FlSKreBaqwhT35gHOcji7hziicZgn9v\n" +
                "j2I4xt1GsusgTfDTG0l5UwKBgBD8bnyoQPr01GlzqeM2xCRG7Q5aPB9yViTbWJuo\n" +
                "E0AVoLSDWpZzFM5bmg/Qapln7YfR9T3/209JYjLGTi90yGbMwNXD5Poxg7aIoW3M\n" +
                "XRRjNuRSVTnDH1r4F9hqIo0Kx+k9VN02NvrhAeZd1+huTysKM60GJl8jlHS+2Lrd\n" +
                "SztlAoGARtJDOXzZyl5miprUC0FfzZMEebHQec46q39JvWq/dttuUeg+2E0nTIxH\n" +
                "oM5CAvt/sWih1juxVbb5hFbKnMjpPkT8QzYCDEPY/UWWdmCQDBiuqGoCHiQLvx27\n" +
                "m5inhsARUygD7j+f13q8Zgi+Rc+ScB9vVfbgk0eHsln+Kze31YY=\n" +
                "-----END RSA PRIVATE KEY-----\n"

            try {
                const decryptedFiles = await Promise.all(
                    files.map(async (f) => {
                        console.log(`Encrypted key (Base64): ${f.key}`);
                        const decryptedKey = await cryptoService.decryptAesKey(pk, f.key);
                        console.log(`Decrypted key for ${f.name}:`, decryptedKey);
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
