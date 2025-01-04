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
import {DataTable} from "@/components/ui/data-table.tsx";
import {columns} from "@/components/files-table/files-column.tsx";
import {MyFilesAtom} from "@/core/atoms/my-files-atom.ts";

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

      // Step 3: Encrypt the file with AES key
      const encryptedFile = await cryptoService.encryptWithAes(aesKey, fileDataString);

      // Step 4: Encrypt the AES key with the public key from the parameters
      const s = publicKey;


      const encryptedAesKey = await cryptoService.encryptAesKey(//TODO Fix how to get the public key from the parameters
           s!
          ,aesKey);

      const base64Content = arrayBufferToBase64(encryptedFile);

      const dto: UploadFileDTO = {
        ownerDisplayName: user.preferred_username,
        name: file.name,
        content: base64Content,
        contentType: file.name.split(".").pop() ?? "unknown",
        key: encryptedAesKey,
        ownerId: user?.sub,
      }

      await fileService.uploadFile(token,dto)
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
      setMyFiles(await fileService.getAllFilesByOwnerId(token))
    }

    if(token && !myFiles) {
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
              <DataTable columns={columns} data={myFiles}/>
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
