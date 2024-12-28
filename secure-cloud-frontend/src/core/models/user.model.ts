export interface User {
    address: Record<string, unknown>; 
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    preferred_username: string;
    sub: string;
    avatar: string;
    email: string;
}
