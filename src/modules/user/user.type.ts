export enum IRoles {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export interface IUser {
    id: string,
    name: IRoles,
}