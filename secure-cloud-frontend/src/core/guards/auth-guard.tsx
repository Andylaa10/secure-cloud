import React from "react";
import {Navigate} from "react-router-dom";
import {useAtom} from "jotai";
import {UserAtom} from "@/core/atoms/user-atom.ts";

const AuthGuard: React.FunctionComponent<{ children: JSX.Element }> = ({ children }) => {
    const [user] = useAtom(UserAtom);

    if(user) {
        return children;
    } else {
        return <Navigate to="/sign-up" />;
    }
};

export default AuthGuard;
