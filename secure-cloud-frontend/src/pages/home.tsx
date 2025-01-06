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

        setSelectedFile(file);

        if (user?.sub === undefined) return;

        try {
            // Step 2: Generate AES key
            const aesKey = await cryptoService.generateAesKey();
            console.log(aesKey, "aesKey");

            // Step 3: Encrypt the file with AES key
            const { encryptedFile, ivBytes } = await cryptoService.encryptFile(aesKey, fileData);

            // Step 4: Encrypt the AES key with the public key from the parameters
            const encryptedAesKey = await cryptoService.encryptAesKey(publicKey!, aesKey);

            // Step 5: Convert the encrypted file to Base64 for storage
            const base64Content = arrayBufferToBase64(encryptedFile);

            // Prepare the DTO for uploading
            const dto: UploadFileDTO = {
                ownerDisplayName: user.preferred_username,
                name: file.name,
                content: base64Content,  // Base64-encoded content
                contentType: file.name.split(".").pop() ?? "unknown",
                key: encryptedAesKey,
                ownerId: user?.sub,
                iv: arrayBufferToBase64(ivBytes)
            };

            // Step 6: Upload the file
            await fileService.uploadFile(token, dto);
        } catch (error) {
            console.error("Error during file upload:", error);
            throw error;  // You can add user feedback here, e.g., a toast message
        } finally {
            // Reset the file upload state
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
                "MIIEpQIBAAKCAQEA2h15SWfVVLvGDsklbFKx4t7RgGh6x8UDlSbkvxNbRTQrQMVj\n" +
                "mmYFECNtXG6enkVxdx7HH0QDu/A4Dl+CQUJLSZ4kaOtQ25DOfxzUm40zG9MBB9t6\n" +
                "eY60MSsM/l7SwipAgXLXMLKU6SdiRMgklp7pQwHZTfh3Uwko+70yUREhIQgSwIOS\n" +
                "49w35v1UdVffJ1snnoL4WJHJM3+GQPz96EUek03HAAF0/0+G30TyQHmo3R6NWj1k\n" +
                "qpzkH2BWkO7QthVAVLr9sw3t9o56lJk7IiW5qfjglguIxhkohnJ3Ay7NiSPoFXaN\n" +
                "rt/mQHhxGlC/y2DLX/yX3Jwds3UxTWjthTzZLQIDAQABAoIBAQDGpG0fY0cwgkqg\n" +
                "kKRagP2s5szaK00WvuDCZ8eQFWrcHeT+ekZ6CUu3JOymb8BZ2Fi76fXjDahw8xe6\n" +
                "T1VrZZr3kuUKALWFId5Oec1PVUskngikRUjHiCWnWdPdnjJHzv8sZZCBs0JXDR08\n" +
                "EyLvYg6Cjh6AGjdiEkeW7Pn0RqtrTiWieVP+k+8k0xQgtkMK9Y88qz7US+/Y9zAp\n" +
                "P6trFXgXic6YvUIJLGW5KrIKhQBTXQlvPnGSwbm9jZng49mZD0gdAT7t46R7AhIt\n" +
                "AHzHnNkVWKW9YR4oJM7wpeqaYl2p8nAJXxeiXnG+A6FppnhvfCNiAGDrtNDMKy+v\n" +
                "plWszHnpAoGBAPwycop3fV4WKo8eIFF24GURnHhJfpLIRJgF16lpEsQc3X+L5nTh\n" +
                "DtiZ21Ipt9hkDo6RNKtUz1nMlpmCHM+OLRBnzWzH7pmHOuhPKXyfeCdMoxn+9S+M\n" +
                "wV8nKIsan0TAS9hxOXKnTI7zlPq4grpjxx71xjeicDGI4bYBv+yzrpWXAoGBAN1n\n" +
                "ddv/QXrtv4ab6OaY8mZOyIwWZ/kxM9/cUqVegFML91ElA802j74OlCsNCsS+sdZU\n" +
                "RI2346uGMz6aqeqXXC9+z+K9xFAxxnrvEW1yH6aMXuGTwVlQHSzu9jfpBQ5JQELJ\n" +
                "J4+0UKCvYuuQTs4/M/Uu8kuNp++PHx5dMahAikfbAoGBAL4BxApOvEWGrcnmCLNX\n" +
                "vPhorFp0BMjR2dwviqw4XcsjdD4EST0F0wmd4X+lrr15pP4EqIns+8vMOCqvvMUj\n" +
                "eRBDJKIwf7NsDxW3jqo1+3CgbMHJNTD9+zKVbhZfmF9UAdCwfXfEVAnfuv6qxNNp\n" +
                "GTxaL1z7JUwstOFLsC3FsmNBAoGASHwmye+3sFdF7Pv+NAC+21/PqI1tXNgO86te\n" +
                "I2Xc/VNdlONZa0YBqWd8etu6Os9zyYetKfiaQP2eqVBZcMQ9Gg+aX9FhBCBHqte6\n" +
                "DOrgEdbC+Xc2RddEtgFF+uf/D75Lm5HfsdyGyRSifhywsDVg/VRxXurxoCxrM7Wv\n" +
                "HDaFDyECgYEA6IstFwY8nxx+584GTKvuRfZVs6mEKCkoUU8MVWFy/1tNd/Lz/07E\n" +
                "Cs5RnyW2ZxedAkF8hCX0gMZl9tirked5jnGDhH200pHNX5PDhQYKfuwWM/bp+9Ry\n" +
                "4N2yQ3Buqx8LhujgoXL2uODWI6GWY5rePnWWwydpRcHwVN5tu/RugHY=\n" +
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
