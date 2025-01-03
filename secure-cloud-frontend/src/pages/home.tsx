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
import {UserAtom} from "@/core/atoms/userAtom.ts";
import {CryptoService} from "@/core/services/crypto-service.ts";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {TokenAtom} from "@/core/atoms/tokenAtom.ts";
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
  const [contentType, setContentType] = useState<string | undefined>('');
  const fileInputRef = useRef<any | null>(null);
  const fileService = new FileService();


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


  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setContentType(file.name.split(".").pop())


      if (user?.sub === undefined || contentType === undefined) return;

      try {
        await fileService.uploadFile({
          name: file.name,
          content: file.name,
          contentType: contentType,
          ownerId: user?.sub,
        })
      } catch (error) {
        console.error(error);
      }
    }
    setIsUploadDialogOpen(false);
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
              <AlertDialogTitle>THIS KEY CANNOT BE SHARED AND NEEDS TO BE SAVED IN A SECURE PLACE</AlertDialogTitle>
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
