import {File, House, Users} from "lucide-react"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar,} from "@/components/ui/sidebar"
import React, {useEffect} from "react";
import {NavUser} from "@/components/nav-user.tsx";
import {NavMain} from "@/components/nav-main.tsx";
import {UserAtom} from "@/core/atoms/userAtom";
import {useAtom} from "jotai";

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Home",
            url: "home",
            icon: House,
            isActive: true,
        },
        {
            title: "My files",
            url: "files",
            icon: File,
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

    useEffect(() => {
        console.log(user);
    }, [user])

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
