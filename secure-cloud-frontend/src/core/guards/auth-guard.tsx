import React, {ReactNode} from "react";
import {Navigate} from "react-router-dom";

const AuthGuard: React.FunctionComponent<{ children: ReactNode  }> = ({ children }) => {
    return <Navigate to="/dashboard" />;
};

export default AuthGuard;
