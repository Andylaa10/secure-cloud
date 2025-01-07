export interface KeyCloakUser {
    address: Record<string, unknown>; 
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    preferred_username: string;
    sub: string;
    avatar: string;
    email: string;
    publicKey: string;
}

export interface KeyCloakCustomUser {
    access: {
        manageGroupMembership: boolean;
        view: boolean;
        mapRoles: boolean;
        impersonate: boolean;
        manage: boolean;
    };
    impersonate: boolean;
    manage: boolean;
    manageGroupMembership: boolean;
    mapRoles: boolean;
    view: boolean;
    attributes: any[];
    createdTimestamp: number;
    email: string;
    emailVerified: boolean;
    enabled: boolean;
    firstName: string;
    id: string;
    lastName: string;
    notBefore: number;
    totp: boolean;
    username: string;
}
