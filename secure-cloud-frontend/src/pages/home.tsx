import {Button} from "@/components/ui/button"
import {UpdateUserDTO} from "@/core/dtos/updateUserDTO.ts";
import {useEffect, useState} from "react";
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
import {UserAtom} from "@/core/atoms/userAtom.ts";
import {CryptoService} from "@/core/services/crypto-service.ts";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {TokenAtom} from "@/core/atoms/tokenAtom.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"

import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form"
import {CopyIcon, EyeIcon, EyeOffIcon} from "lucide-react";
import {Toaster} from "@/components/ui/toaster.tsx";
import {useToast} from "@/hooks/use-toast.ts";

export default function Home() {
    const [token] = useAtom(TokenAtom);
    const [user] = useAtom(UserAtom);
    const [pk, setPk] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const cryptoService = new CryptoService();
    const keyCloakService = new KeycloakService();
    const {toast} = useToast();
    const [showPassword, setShowPassword] = useState(true);


    useEffect(() => {
        const handleKeyPair = async () => {
            if (user) {
                const test = await keyCloakService.getUserByUsername(user.preferred_username, token);
                if (!test[0]['attributes']) {
                    const {publicKey, privateKey} = await cryptoService.generateKeyPair();

                    const dto: UpdateUserDTO = {
                        email: user.email,
                        username: user.preferred_username,
                        firstName: user.given_name,
                        lastName: user.family_name,
                        publicKey: publicKey,
                    }

                    await keyCloakService.updateUserPublicKey(token, test[0].id, dto);

                    console.log(privateKey)
                    setPk(privateKey);
                    setIsDialogOpen(true);
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

    useEffect(() => {
        if (pk) {
            setIsDialogOpen(true);
            form.setValue('pk', pk);
        }
    }, [pk, form]);

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
            <Button>Click me home</Button>
            <AlertDialog open={isDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>THIS KEY CANNOT BE SHARED AND NEEDS TO BE SAVED IN A SECURE PLACE</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <Form {...form}>
                                    <form>
                                        <div className="w-full">
                                            <FormField
                                                control={form.control}
                                                name="pk"
                                                render={({ field }) => (
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
                            onClick={()=> togglePassword()}
                        >
                            {showPassword
                                ?
                                (<EyeIcon className="select-none" />)
                                :
                                (<EyeOffIcon className="select-none" />)}
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                        >
                            <CopyIcon />
                        </Button>
                        <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                <Toaster />
            </AlertDialog>
        </div>
    )
}
