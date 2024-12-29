import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Separator} from "@radix-ui/react-separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {useEffect} from "react";
import {useAtom} from "jotai";
import {TokenAtom} from "@/core/atoms/tokenAtom";
import {UserAtom} from "@/core/atoms/userAtom";
import {useToast} from "@/hooks/use-toast.ts";
import {Toaster} from "@/components/ui/toaster.tsx";

export default function Dashboard() {
    const location = useLocation();
    const pageURL = location.pathname.split('/')[2];
    const navigate = useNavigate();
    const [token, setToken] = useAtom(TokenAtom);
    const [, setUser] = useAtom(UserAtom);
    const keyCloakService = new KeycloakService();
    const {toast} = useToast();

    useEffect(() => {
        const handleKeycloakRedirect = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get("code");
            const state = searchParams.get("state");

            if (code && state) {
                try {
                    const storedVerifier = localStorage.getItem(state);
                    if (!storedVerifier) throw new Error("Missing PKCE code verifier");

                    const token = await keyCloakService.getUserToken(code, storedVerifier);
                    console.log(token);
                    setToken(token["access_token"]);

                    const userInfo = await keyCloakService.getUserInfo(token["access_token"]);
                    setUser(userInfo.data);

                    navigate(location.pathname, { replace: true });
                    toast({
                        title: `Welcome ${userInfo.data['name']}`,
                    });
                } catch (error) {
                    console.error("Keycloak authentication failed:", error);
                    navigate("/sign-up", { replace: true });
                }
            }
        };

        if (!token) {
            handleKeycloakRedirect();
        }
    }, [location, token, setToken, setUser, navigate]);


    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{pageURL}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="pr-4">
                        <ModeToggle/>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <Outlet/>
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    )
}
