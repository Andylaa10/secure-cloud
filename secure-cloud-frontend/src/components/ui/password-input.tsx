import * as React from "react"

import {Input} from "@/components/ui/input.tsx";
import {EyeIcon, EyeOffIcon} from "lucide-react";


const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        return (
            <Input
                className={className}
                type={showPassword ? 'text' : 'password'}
                ref={ref}
                {...props}
                suffix={showPassword ?
                    (<EyeIcon className="select-none" onClick={() => setShowPassword(false)} />)
                    :
                    (<EyeOffIcon className="select-none" onClick={() => setShowPassword(true)} />) } />
        )
    }
)
PasswordInput.displayName = "PasswordInput"

export {PasswordInput}
