import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {effect, z} from "zod"

import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {ModeToggle} from "@/components/mode-toggle"
import {KeycloakService} from "@/core/services/keycloak-service"
import {RegisterDTO} from "@/core/dtos/registerDTO.ts";
import {useToast} from "@/hooks/use-toast.ts";
import {Toaster} from "@/components/ui/toaster.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {PasswordInput} from "@/components/ui/password-input.tsx";
import {CryptoService} from "@/core/services/crypto-service.ts";

export default function SignUp() {
    const {toast} = useToast();
    const keyCloakService = new KeycloakService();
    const cryptoService = new CryptoService();

    const FormSchema = z.object({
        email: z.string().email("Please provide an email"),
        password: z.string().min(6, "Minimum 6 characters"),
        repeatPassword: z.string().min(6, "Minimum 6 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(255, "Username must maximum be 255 characters"),
        firstname: z.string().min(1, "Firstname is required"),
        lastname: z.string().min(1, "Lastname is required")
    }).refine((data) => data.password === data.repeatPassword, {
        path: ["repeatPassword"],
        message: "Passwords don't match",
    }).refine((data) => data.repeatPassword === data.password, {
        path: ["password"],
        message: "Passwords don't match",
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
            repeatPassword: "",
            username: "",
            firstname: "",
            lastname: ""
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const {publicKey, privateKey } = await cryptoService.generateKeyPair();
        const dto: RegisterDTO = {
            email: data.email,
            password: data.password,
            username: data.username,
            firstName: data.firstname,
            lastName: data.lastname,
            publicKey: publicKey,
        }

        console.log(privateKey)
        console.log(publicKey)

        const user = await keyCloakService.register(dto);

        if (user) {
            console.log(user)
            toast({
                title: "Registration was successful",
            });
            document.location.href = keyCloakService.login();
        }
    }

    function redirect() {
        document.location.href = keyCloakService.login();
    }

    return (
        <div className="w-full h-screen flex justify-center items-center flex-col">
            <Card>
                <CardHeader className="flex justify-center items-center px-2 py-2">
                    <img src="src/assets/logo.png" alt="Logo"/>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="w-full flex flex-row">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem className="mr-2">
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="you@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({field}) => (
                                        <FormItem className="ml-2">
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John123" {...field} />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.username?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-full">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder="*******" {...field} />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="repeatPassword"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Repeat Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder="*******" {...field} />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-full flex flex-row">
                                <FormField
                                    control={form.control}
                                    name="firstname"
                                    render={({field}) => (
                                        <FormItem className="mr-2">
                                            <FormLabel>Firstname</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.firstname?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastname"
                                    render={({field}) => (
                                        <FormItem className="ml-2">
                                            <FormLabel>Lastname</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.lastname?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button className="w-full" type="submit"
                                    disabled={Object.keys(form.formState.errors).length > 0}>Register</Button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>
                            <Button className="w-full" variant="outline" onClick={() => redirect()}>KeyCloak</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="absolute top-2 right-2">
                <ModeToggle/>
            </div>
            <Toaster/>
        </div>
    );
}

