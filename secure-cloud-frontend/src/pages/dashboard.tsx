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
import {Outlet, useLocation} from "react-router-dom";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {useEffect} from "react";
import {useAtom} from "jotai";
import {TokenAtom} from "@/core/atoms/tokenAtom";
import {UserAtom} from "@/core/atoms/userAtom";

export default function Dashboard() {
    const location = useLocation();
    const pageURL = location.pathname.split('/')[2];
    const [token, setToken] = useAtom(TokenAtom);
    const [, setUser] = useAtom(UserAtom);
    const keyCloakService = new KeycloakService();


    useEffect(() => {
        const getUserInfo = async () => {
            const search = window.location.search;
            const params = new URLSearchParams(search);
            const code = params.get('code') ?? null;
            const codeVerifier = params.get('state') ?? null;
            console.log('Code:', code, 'State:', codeVerifier);

            if (code && codeVerifier) {
                const tok = await keyCloakService.getUserToken(code, localStorage.getItem(codeVerifier)!)
                setToken(tok['access_token']);
                console.log('Token set:', token);
                const info = await keyCloakService.getUserInfo(tok['access_token']);
                console.log(info.data);
                setUser(info.data);
            }
        }

        if (!token) {
            getUserInfo().then(info => console.log(info));
        }
    }, [token, keyCloakService]);


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
        </SidebarProvider>
    )
}
