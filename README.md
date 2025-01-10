# Secure Software Development - Exam 2025

<br/>

<div align="center">
  <img src="https://github.com/user-attachments/assets/f8bc80d5-ec28-44ba-bdf0-5fc8bc7705e8" style="width: 450px; height: auto;">
</div>


## Business Case

### Introduction
Secure file storage is a key concern in protecting sensitive data. A strong authentication method in the form of Single Sign-On (SSO), combined with end-to-end encryption, play an important role in keeping user data safe. Taking these measures into account can help ensure users upload are safe and the data is stored securely. Furthermore, sharing sensitive data can also benefit from these safeguards, allowing files to be exchanged with confidence that they remain protected throughout the process. 

### Problem Statement
The increasing need for digital platforms for file storage and sharing, has exposed sensitive data to potential security threats. This includes unauthorized access and data breaches, where traditional authentication methods often fall short in addressing these modern security challenges and unfortunately leaving the users data in a vulnerable state.
<br/>

To address these concerns, a robust solution is required that combines advanced authentication mechanisms and encryption techniques. By using OpenId Connect for secure Single Sign-On (SSO), together with implementing end-to-end encryption in the form of a hybrid approach, containing symmetric encryption for files and asymmetric encryption for keys, we aim to create a secure file storage and sharing environment, ensuring data integrity and privacy. 

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff)
![.NET](https://img.shields.io/badge/.NET-512BD4?logo=dotnet&logoColor=fff)

## Requirements
- **Node.js** v.22+ or latest (If not already installed)
- **Docker Desktop** https://www.docker.com/products/docker-desktop/ (If not already installed)

## How to run
1. Clone the repository
2. Navigate to the root of the project `secure-cloud` and run the following command:
```
docker compose up --build
```
3. After composing the project, go to `http://localhost:8080/` and you are now ready to configure KeyCloak

## KeyCloak Setup Guide - secure-cloud
1. Go to `http://localhost:8080/` and login with the following credentials:
```
USERNAME: admin
PASSWORD: admin
```
2. You are now logged in and ready to configure KeyCloak


### Clients
1. Go to `clients` in the left tab
2. Start creating a new client by pressing the `Crearte client` button
3. Give the Client ID the following id:
```
secure-cloud
```
4. Press next, and now turn on `Client authentication` & check the `Service accounts roles` field.
5. Press next, and here it is important to fill in the valid redirect URIs, with the following:
```
http://localhost:8083/dashboard/home
```
6. Add two web origins with the following:
```
http://localhost:8083
```
```
*
```
7. Press Save and then go to the `Credentials` tab.
8. Here you should copy and save the `Client Secret`, you will need this for your `.env` file later.
9. Go to the `Service accounts roles` tab and press the `Assign role` button.
10. In the assign role popup, click the `Filter by clients` dropdown menu (left corner).
11. Choose `Filter by realm roles` and pick the admin and press `assign`.
12. You are now done with configuring clients 🔥

### Realm Settings
1. Navigate to the `Realm settings`in the left tab-menu.
2. Go to the second last tab called `User profile` and press the `Create attribute` button.
3. The attribute should have the following:
```
Attribute[Name] = publicKey
Display name = ${publicKey}
```
4. Under the `Permission` field, check all boxes to allow all permissions.
5. Finally under `Annotations`, press the `Add Annotations` button and pick the following:
```
Key = inputType
Value = text
```
6. Now press create and the user profile configuration is done.
7. Under the realm settings, navigate to the next tab called `User registration` & click the `Assign role` button.
8. Scroll down until you find a role called `master-realm manage-users` with the description `role_manage-users`.
9. Assign this role.
10. Furthermore go to the `Tokens tab` and scroll down until you see the `Access tokens` section.
11. Set the `Access Token Lifespan` to 30 minutes and press save.
12. You are now done with configuring the `Realm settings` 🔥


### Users
1. Navigate to the `Users` in the left tab-menu and pick the `admin` user.
2. Go to the `Role mapping` tab and click `Assign role`.
3. Press the button that checks all roles and assign all possible roles to the admin.
4. You are now done with configuring users 🔥

