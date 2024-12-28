import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"

import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {ModeToggle} from "@/components/mode-toggle"
import {KeycloakService} from "@/core/services/keycloak-service"
import {RegisterDTO} from "@/core/dtos/registerDTO.ts";

export default function SignUp() {
    const keyCloakService = new KeycloakService();

    const FormSchema = z.object({
        email: z.string().email("Please provide an email"),
        password: z.string().min(6, "Minimum 6 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(255, "Username must maximum be 255 characters"),
        firstname: z.string().min(1, "Firstname is required"),
        lastname: z.string().min(1, "Lastname is required")
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
            username: "",
            firstname: "",
            lastname: ""
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const dto: RegisterDTO = {
            email: data.email,
            password: data.password,
            username: data.username,
            firstName: data.firstname,
            lastName: data.lastname,
        }
        await keyCloakService.register(dto)
    }

    return (
        <div className="w-full h-screen flex justify-center items-center flex-col">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
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
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="*******" type="password" {...field} />
                                </FormControl>
                                <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="John123" {...field} />
                                </FormControl>
                                <FormDescription>This is your public display name.</FormDescription>
                                <FormMessage>{form.formState.errors.username?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({field}) => (
                            <FormItem>
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
                            <FormItem>
                                <FormLabel>Lastname</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage>{form.formState.errors.lastname?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-between items-center">
                        <span><a href={keyCloakService.login()}>Login here</a></span>
                        <Button type="submit" disabled={Object.keys(form.formState.errors).length > 0}>Register</Button>
                    </div>
                </form>
            </Form>
            <div className="absolute top-2 right-2">
                <ModeToggle/>
            </div>
        </div>
    );
}
