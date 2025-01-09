import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"

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
import {useState} from "react";
import {ArrowLeftIcon, SkipBackIcon} from "lucide-react";

export default function SignUp() {
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const {toast} = useToast();
  const keyCloakService = new KeycloakService();

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
    const dto: RegisterDTO = {
      email: data.email,
      password: data.password,
      username: data.username,
      firstName: data.firstname,
      lastName: data.lastname,
    }

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
        <Card className={"min-w-96"}>
          {isRegisterClicked && (
              <Button
                  variant="outline"
                  className="w-11 my-4 mx-6" onClick={()=>setIsRegisterClicked(false)}>
                <ArrowLeftIcon/>
              </Button>
          )}
          <CardHeader className="flex justify-center items-center px-2 py-6">
            <img src="src/assets/Logo.png" alt="Logo"/>
            <div className="text-xl py-2 font-bold">
              {isRegisterClicked ? "Register User" : "Sign In"}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {isRegisterClicked && (
                    <div className="w-full">
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
                    </div>
                )}
                {!isRegisterClicked && (
                    <Button className="w-full" variant="outline" onClick={() => redirect()}>Log in via SSO</Button>)}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    {!isRegisterClicked && (<span className="bg-card px-2 text-muted-foreground">Or</span>)}
                  </div>
                </div>
                {!isRegisterClicked && (
                    <Button
                        className="w-full"
                        onClick={() => setIsRegisterClicked(true)}
                    >
                      Register
                    </Button>
                )}

                {isRegisterClicked && (
                    <Button
                        className="w-full"
                        type="submit"
                        disabled={Object.keys(form.formState.errors).length > 0}
                    >
                      Save and Register
                    </Button>
                )}
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

