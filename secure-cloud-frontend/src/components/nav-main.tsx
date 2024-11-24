import {type LucideIcon} from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export function NavMain({items, label}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
    }[];
    label: string;
}) {

    const navigate = useNavigate();
    const [activeItems, setActiveItems] = useState(items.map((item) => ({...item})));

    const toggleActiveItem = (index: number) => {
        setActiveItems((prevItems) =>
            prevItems.map((item, idx) => ({
                ...item,
                isActive: idx === index,
            }))
        );
        navigate(items[index].url);
    };


    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {activeItems.map((item, index) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton tooltip={item.title} onClick={() => toggleActiveItem(index)}>
                            {item.icon && <item.icon
                                className={item.isActive ? 'stroke-[#5838FB] fill-[#5838FB]' : 'font-medium'}/>}
                            <span className={item.isActive ? 'text-[#5838FB] font-bold' : 'font-medium'}
                                  onClick={() => {
                                      item.isActive = !item.isActive
                                  }}>
                                {item.title}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
