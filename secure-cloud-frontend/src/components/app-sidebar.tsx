import {File, Users} from "lucide-react"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar,} from "@/components/ui/sidebar"
import React from "react";
import {NavUser} from "@/components/nav-user.tsx";
import {NavMain} from "@/components/nav-main.tsx";
import {UserAtom} from "@/core/atoms/user-atom.ts";
import {useAtom} from "jotai";

// This is sample data.
const data = {
    navMain: [
        {
            title: "My Files",
            url: "home",
            icon: File,
            isActive: true,
        },
        {
            title: "Shared",
            url: "shared",
            icon: Users,
        },
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const [user] = useAtom(UserAtom);
    const sidebarContext = useSidebar();

    return (
        <Sidebar collapsible="icon" {...props}>
            {sidebarContext.open
                ?
                <SidebarHeader className="flex justify-center items-center h-40">
                    <img src={"../src/assets/logo.png"} alt="logo"/>
                </SidebarHeader>
                :
                <div></div>
            }

            <SidebarContent>
                <NavMain items={data.navMain} label={'Navigate'}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
