import {BadgeCheck, ChevronsUpDown, LogOut,} from "lucide-react"

import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar"
import {User} from "@/core/models/user.model"
import {Skeleton} from "./ui/skeleton"
import {KeycloakService} from "@/core/services/keycloak-service.ts";
import {useNavigate} from "react-router-dom";
import {useAtom} from "jotai/index";
import {TokenAtom} from "@/core/atoms/token-atom.ts";
import {UserAtom} from "@/core/atoms/user-atom.ts";

export function NavUser({user}: { user: User | null }) {
    const {isMobile} = useSidebar();
    const keyCloakService = new KeycloakService();
    const navigate = useNavigate();
    const [,setTokenAtom] = useAtom(TokenAtom);
    const [, setUserAtom] = useAtom(UserAtom);


    async function logOut() {
        if (user) {
            await keyCloakService.logout(user.sub);
            localStorage.clear();
            setTokenAtom("");
            setUserAtom(null);
            navigate('/sign-up');
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                {user ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={'https://github.com/shadcn.png'} alt={user.preferred_username ?? 'unknown'}/>
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name ?? 'unknown'}</span>
                                <span className="truncate text-xs">{user.email ?? 'unknown'}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={'https://github.com/shadcn.png'} alt={user.preferred_username ?? 'unknown'}/>
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name ?? 'unknown'}</span>
                                    <span className="truncate text-xs">{user.email ?? 'unknown'}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck/>
                                Account
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => logOut()}>
                            <LogOut/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu> : <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-[250px] rounded-xl"/>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]"/>
                        <Skeleton className="h-4 w-[200px]"/>
                    </div>
                </div>} {/*** TODO Find skeleton that matches the sidebar ***/}
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
