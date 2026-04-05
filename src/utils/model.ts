export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    mobileNumber: string;
    createdAt: string; // You can also use `Date` if you parse the ISO string
    updatedAt: string; // You can also use `Date` if you parse the ISO string
    __v: number;
    refreshToken: string;
}

export interface LoginData {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    statusCode: number;
    data: LoginData;
    message: string;
    success: boolean;
}
