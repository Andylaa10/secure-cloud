import axios from 'axios';
import {RegisterDTO} from "@/core/dtos/registerDTO.ts";
import {User} from '../models/user.model';
import {UpdateUserDTO} from "@/core/dtos/updateUserDTO.ts";

export class KeycloakService {
    clientSecret?: string = import.meta.env.VITE_CLIENT_SECRET;
    clientId?: string = import.meta.env.VITE_CLIENT_ID;

    api = axios.create({
        baseURL: `http://localhost:8080/`
    });

    /**
     * Token for creating new users and passwords
     */
    async getUserToken(code: string, code_verifier: string): Promise<string> {
        const parameters = {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'http://localhost:8083/dashboard/home',
            code_verifier: code_verifier,
            client_id: this.clientId!,
            client_secret: this.clientSecret!,
        };

        const response = await fetch('http://localhost:8080/realms/master/protocol/openid-connect/token', {
            method: 'POST',
            body: new URLSearchParams(parameters),
        });

        return await response.json();
    }

    async getToken(): Promise<string | null> {
        const url = 'realms/master/protocol/openid-connect/token';
        const data = new URLSearchParams();
        data.append('client_id', this.clientId!);
        data.append('client_secret', this.clientSecret!);
        data.append('grant_type', 'client_credentials');

        try {
            const response = await this.api.post(url, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            return response.data['access_token'];

        } catch (error) {
            console.error('Error fetching token:', error);
            return null;
        }
    }

    /**
     * Register a new user and setting the password
     * @param dto
     */
    async register(dto: RegisterDTO): Promise<User | null> {
        const token = await this.getToken();

        const data = {
            email: dto.email,
            username: dto.username,
            firstName: dto.firstName,
            lastName: dto.lastName,
            emailVerified: false,
            enabled: true,
            requiredActions: [],
            groups: [],
        }

        // Create user
        const result = await this.api.post(`admin/realms/master/users`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (result.status === 201 && token) {
            // Set the password
            console.log(result);
            const newUser = await this.getUserByUsername(data.username, token)
            if (newUser) {
                await this.setPassword(token, newUser[0]['id'], dto.password);

                return newUser;
            }
            return null;
        }

        return null;
    }

    login() {
        const state = this.generateRandomString();
        const code = this.generateRandomString();
        localStorage.setItem(state, code);
        const parameters = {
            client_id: this.clientId!,
            scope: 'openid email phone address profile',
            response_type: 'code',
            redirect_uri: 'http://localhost:8083/dashboard/home',
            prompt: 'login',
            state: state,
            code_challenge_method: 'plain',
            code_challenge: code,
        };

        const authorizationUri = `http://localhost:8080/realms/master/protocol/openid-connect/auth?${new URLSearchParams(parameters)}`;

        return authorizationUri;
    }

    async getUserInfo(accessToken: string) {
        return await this.api.get('realms/master/protocol/openid-connect/userinfo', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Bearer ' + accessToken,
            },
        });
    }

    async getUserByUsername(username: string, token: string) {
        const result = await this.api.get(`admin/realms/master/users?username=${username}&exact=true`, {
            headers: {
                Authorization: `bearer ${token}`
            }
        });

        if (result.status === 200) {
            return result.data;
        }

        return null;
    }

    /**
     * Set up a new password for the user.
     * @param accessToken
     * @param userId
     * @param password
     */
    async setPassword(accessToken: string, userId: string, password: string) {
        return await this.api.put(`admin/realms/master/users/${userId}/reset-password`, {
            value: password,
        }, {
            headers: {
                Authorization: 'Bearer ' + accessToken,
            }
        });
    }

    private generateRandomString(length: number = 128): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    async logout(userId: string){
        const token = await this.getToken();
        if (token) {
            return await this.api.post(`admin/realms/master/users/${userId}/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    /**
     * Update the update with existing fields and private key
     * @param accessToken
     * @param userId
     * @param dto
     */
    async updateUserPublicKey(accessToken: string, userId: string, dto: UpdateUserDTO) {
        return await this.api.put(
            `admin/realms/master/users/${userId}`,
            {
                email: dto.email,
                username: dto.username,
                firstName: dto.firstName,
                lastName: dto.lastName,
                enabled: true,
                attributes: {
                    publicKey: dto.publicKey,
                },
                requiredActions: [],
                groups: [],
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    }
}
