import { AppDataSource } from '../../config/data-source';
import { User } from './user.model';
import { IRoles } from './user.type';

const userRepository = AppDataSource.getRepository(User);

export default class UserRepository {

    static async fetchUsers() {
        return await userRepository.find();
    }

    static async findUserByUserId(userId: number) {
        return await userRepository.findOneBy({ id: userId });
    }

    static findUserByEmail = async (email: string) => {
        const user = await userRepository.findOne({ where: { email } });
        return user;
    };

    static addUser = async (firstname: string, lastname: string, email: string, role: IRoles) => {

        const user = new User();
        user.firstName = firstname;
        user.lastName = lastname;
        user.email = email;
        // user.isDelete = isDelete;
        user.role = role;

        const createdUser = await userRepository.save(user);
        return createdUser;
    };

    // Save user data
    static saveUser = (data: User) => {
        return userRepository.save(data);
    };

    // Save user data
    static updateUserById = (id:{id:number},data: User) => {
        return userRepository.update(id,data)
    };

    static updateUser = async (email: string, firstName: string, lastName: string, roles: IRoles, userId: number) => {
        const user = await this.findUserByEmail(email);
        if (!user) { return ('user not found'); }

        user.firstName = firstName;
        user.lastName = lastName;
        user.role = roles;
        user.id = userId ;

        const data = await userRepository.save(user);
        return data;
    };

    static updateRoleData = async (email: string, role: IRoles) => {
        const user = await this.findUserByEmail(email);
        if (!user) {
            return ('user not found');
        }
        user.role = role;
        const data = await userRepository.save(user);
        return data;
    };

    static updateUserIdData = async (email: string, id: number) => {
        const user = await this.findUserByEmail(email);
        if (!user) {
            return ('user not found');
        }
        user.id = id;
        const data = await userRepository.save(user);
        return data;
    };

    static deleteUserByEmail = async (email: string) => {
        const user = await userRepository.delete({ email });
        return user;
    };

}
