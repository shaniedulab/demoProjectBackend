import { NextFunction, Request, Response } from 'express';
import UserRepository from "../user/user.service";
import ApiError from '../../api-errors/api-error.util';
import { customResponse } from '../../api-errors/api-error.controller';
import { hash } from '../../utils/auth.util';
import { passwordSchema, updateUserSchema } from '../auth/auth.validator';

export default class UserController {

    public static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserRepository.fetchUsers()

            const modifiedUsers = users.map(({ password, resetPasswordToken, ...rest }) => rest)

            if (!users ) { 
                return next(ApiError.notFound());
            }

            return customResponse(res, 200, modifiedUsers);
        } catch (error) {
            next(error);
        }
    }

    public static async getUser(req: Request, res: Response, next: NextFunction) {
        try {

            const { userId } = req.query;
            const user = await UserRepository.findUserByUserId(Number(userId))

            if (!user ) { 
                return next(ApiError.notFound());
            }

            const { password, resetPasswordToken, ...modifiedUser } = user  

            return customResponse(res, 200, modifiedUser);
        } catch (error) {
            next(error);
        }
    }

    //update a new password for a lined in user.
    static async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { password } = await passwordSchema.validateAsync(req.body);

            const { userId } = req.query
        
            // 4. Check if the user exists and the provided token matches.
            const user = await UserRepository.findUserByUserId(Number(userId));
        
            if (!user ) { 
                return next(ApiError.notFound());
            }
            
            // 3. Hash the new password for security.
            const hashPassword = await hash(password);
        
            user.password = hashPassword
        
            // 6. Save the updated user data.
            const saveUser = await UserRepository.saveUser(user);
        
            if (!saveUser) {
                // 7. Handle a bad request if the user data couldn't be saved.
                return next(ApiError.badRequest());
            }
        
            // 8. Password update was successful.
            return customResponse(res, 200, "Your password has been successfully changed.");
        } catch (error) {
            next(error)
        }
    }

    //updating user profiles
    static async updateMe(req: Request, res: Response, next: NextFunction) {
        try {
            if( req.body.password || req.body.confirmPassword){
                next(ApiError.customError(400,'You can not update your password using this endpoint'))
            }

            // 1. Validate the user input against the mainSchema.
            const result = await updateUserSchema.validateAsync(req.body);

            const { userId } = req.query

            // 6. Save the updated user data.
            const saveUser = await UserRepository.updateUserById({id:Number(userId)},result);      
        
            if (!saveUser.affected) {
                // 7. Handle a bad request if the user data couldn't be saved.
                return next(ApiError.badRequest());
            }
        
            // 8. Password update was successful.
            return customResponse(res, 200, "Your profile successfully updated.");
        
        } catch (error) { 
            next(error)
        }
    }

}