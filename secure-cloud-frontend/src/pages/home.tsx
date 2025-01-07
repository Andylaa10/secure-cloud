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
import {
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  FolderPlusIcon
} from "lucide-react";
import {Toaster} from "@/components/ui/toaster.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {FileService} from "@/core/services/file-service.ts";
import {UploadFileDTO} from "@/core/dtos/uploadFileDTO.ts";
import {MyFilesAtom} from "@/core/atoms/my-files-atom.ts";
import MyFilesTable from "@/components/files-table/files-page.tsx";
import {RsaAtom} from "@/core/atoms/rsa-atom.ts";
import {arrayBufferToBase64} from "@/utils/ArrayBufferToBase64.ts";
import {copyToClipboard} from "@/utils/CopyToClipboard.ts";
import {RsaPublicKeyAtom} from "@/core/atoms/rsa-public-key-atom.ts";

export default function Home() {
  const [token] = useAtom(TokenAtom);
  const [user] = useAtom(UserAtom);
  const [rsa, setRsa] = useAtom(RsaAtom);
  const [rsaPublicKey, setRsaPublicKey] = useAtom(RsaPublicKeyAtom);
  const [myFiles, setMyFiles] = useAtom(MyFilesAtom);

  const [isKeyPairDialogOpen, setIsKeyPairDialogOpen] = useState(false);
  const [isPkDialogOpen, setIsPkDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const cryptoService = new CryptoService();
  const keyCloakService = new KeycloakService();
  const fileService = new FileService();

  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const InitialFormSchema = z.object({
    generatedRsa: z.string().nonempty("This field is required"),
  });

  const initialForm = useForm<z.infer<typeof InitialFormSchema>>({
    defaultValues: {
      generatedRsa: '',
    },
    resolver: zodResolver(InitialFormSchema),
  });

  const UserRsaFormSchema = z.object({
    userRsa: z.string().nonempty("This field is required"),
  });

  const userRsaForm = useForm<z.infer<typeof UserRsaFormSchema>>({
    defaultValues: {
      userRsa: '',
    },
    resolver: zodResolver(UserRsaFormSchema),
  });


  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;
    if (user?.sub === undefined) return;

    setSelectedFile(file);
    const fileData = await file.arrayBuffer();

    try {
      const aesKey = await cryptoService.generateAesKey();
      const {encryptedFile, ivBytes} = await cryptoService.encryptFile(aesKey, fileData);
      const encryptedAesKey = await cryptoService.encryptAesKey(rsaPublicKey, aesKey);

      const dto: UploadFileDTO = {
        ownerDisplayName: user.preferred_username,
        name: file.name,
        content: arrayBufferToBase64(encryptedFile),
        contentType: file.name.split(".").pop() ?? "unknown",
        key: encryptedAesKey,
        ownerId: user?.sub,
        iv: arrayBufferToBase64(ivBytes)
      };

      await fileService.uploadFile(token, dto);
      await handleGetFiles();

      toast({
        icon: <CheckCircle2Icon className="text-green-600"/>,
        title: "Uploaded Successfully!",
        subTitle: file.name
      });

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

  const handleGetFiles = async () => {
    const files = await fileService.getAllFilesByOwnerId(token);
    if (!files || files.length === 0) return;

    try {
      const decryptedFiles = await Promise.all(
          files.map(async (f) => {
            const decryptedKey = await cryptoService.decryptAesKey(rsa, f.key);
            return {...f, key: decryptedKey};
          })
      );

      setMyFiles(decryptedFiles);
    } catch (error) {
      console.error("Error decrypting files:", error);
    }
  }

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
        await keyCloakService.updateUserPublicKey(token, test[0].id, dto);

        setIsKeyPairDialogOpen(true);
        setRsaPublicKey(publicKeyPem);
        setRsa(privateKeyPem);
      } else if (rsa === "" || rsaPublicKey === "") {
        setIsPkDialogOpen(true);
        setRsaPublicKey(test[0]['attributes']['publicKey']);
      }
    }
  }

  useEffect(() => {
    if (user) handleKeyPair(); // Generate RSA key pair, set it in state and atom + show it
  }, [user]);

  useEffect(() => {
    if (rsa !== "") initialForm.setValue('generatedRsa', rsa); // Set the generated RSA key to the initial form pop-up
  }, [rsa, initialForm]);

  useEffect(() => {
    if (token && !myFiles && rsa !== "") handleGetFiles(); // get the files if private key is not empty
  }, [token, myFiles, rsa]);


  const togglePassword= () => {
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

        <AlertDialog open={isKeyPairDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>THIS KEY CANNOT BE SHARED AND NEEDS TO BE SAVED IN A SECURE
                PLACE</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <Form {...initialForm}>
                    <form>
                      <div className="w-full">
                        <FormField
                            control={initialForm.control}
                            name="generatedRsa"
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
                  onClick={async () => {
                    await copyToClipboard(rsa);
                    toast({
                      title: "Copied!",
                    })
                  }
                  }
              >
                <CopyIcon/>
              </Button>
              <AlertDialogAction onClick={() => setIsKeyPairDialogOpen(false)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          <Toaster/>
        </AlertDialog>


        <AlertDialog open={isPkDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>INSERT YOUR PRIVATE KEY</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <Form {...userRsaForm}>
                    <form>
                      <div className="w-full">
                        <FormField
                            control={userRsaForm.control}
                            name="userRsa"
                            render={({field}) => (
                                <FormItem>
                                  <FormLabel>
                                    Private Key
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}>

                                    </Input>
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
              <AlertDialogAction onClick={() => {
                setRsa(userRsaForm.getValues().userRsa)
                setIsPkDialogOpen(false)
              }} disabled={!userRsaForm.watch('userRsa')}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}
