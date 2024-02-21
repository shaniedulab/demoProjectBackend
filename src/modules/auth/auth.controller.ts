import { Request, Response, NextFunction } from "express";
import { customResponse } from "../../api-errors/api-error.controller";
import { compare, generateJWT, hash, verifyJWT } from "../../utils/auth.util";
import ApiError from "../../api-errors/api-error.util";
import { emailSchema, loginSchema, passwordSchema, registerUserSchema } from "./auth.validator";
import UserRepository from "../user/user.service";
import { IRoles } from "../user/user.type";
import logger from "../../config/logger";

export default class AuthController {
  static login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Log the request headers for debugging purposes.
      // 2. Validate the request body to ensure it contains a valid email and password.
      const result = await loginSchema.validateAsync(req.body);
      const { email, password } = result;

      // 3. Check if the user exists in the database.
      const user = await UserRepository.findUserByEmail(email);

      // 4. If the user doesn't exist, return a 422 Unprocessable Entity error.
      if (!user)
        return next(
          ApiError.customError(422, "email or password is incorrect")
        );

      // 5. Compare the provided password with the user's stored password.
      const passwordMatch = await compare(password, user.password);

      // 6. If the passwords don't match, return a 422 Unprocessable Entity error.
      if (!passwordMatch)
        return next(
          ApiError.customError(422, "email or password is incorrect")
        );

      // 7. Remove the password from the user object to avoid exposing it.
      // user.password = "";

      // 8. Generate a JSON Web Token (JWT) for user authentication.
      const JWT = generateJWT(user.id);

      // 9. Return a success response with the JWT for user authentication.
      return customResponse(res, 200, JWT);
    } catch (error) {
      // 10. Handle and pass on any errors that may occur during this process.
      next(error);
    }
  };

  static register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validate the user input against the mainSchema.
      const result = await registerUserSchema.validateAsync(req.body);

      // 3. Extract user registration data.
      const { email } = result;

      const user = await UserRepository.findUserByEmail(email);
      console.log("user", user);

      if (user) {
        return next(ApiError.customError(422, "user already exists"));
      }

      //removing conform password before saving database
      delete result.confirmPassword;

      // 4. Hash the user's password for security.
      result.password = await hash(result.password);

      result.role = IRoles.USER;

      // 5. Save user registration data to the database.
      const createdUser = await UserRepository.saveUser(result);

      // 7. Remove the password from the user object to avoid exposing it.
      createdUser.password = "";

      // 8. Generate a JSON Web Token (JWT) for user authentication.
      const JWT = generateJWT(createdUser);

      //sending response
      return customResponse(res, 201, JWT);
    } catch (error) {
      // 14. Handle and pass on any errors that may occur during the registration process.
      next(error);
    }
  };

  // static async sendOtp(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     // 1. Validate the request body to ensure it contains a valid email address.
  //     const result = await shopRegisterSchema.validateAsync(req.body);
  //     const { email, userRole } = result;

  //     // 2. Check if the user with the given email already exists. If so, return a 409 conflict error.
  //     const user = await AuthRepository.getUserByEmail(email);
  //     if (user && user.role !== "shop")
  //       return next(ApiError.customError(409, "User already exists"));

  //     if (user && user.role === userRole)
  //       return next(ApiError.customError(409, "User already exists"));

  //     // 3. Delete any existing temporary user data associated with the email.
  //     await AuthRepository.deleteTempUserByEmail(email);

  //     // 4. Generate a new OTP (One-Time Password) and set an expiration time for it.
  //     const otp = generateOTP();
  //     const expirationTime = new Date(Date.now() + 600000);

  //     // 5. Save the OTP and email with an expiration time as temporary user data.
  //     const tempUserData: ITempUserData = { otp, email, expirationTime };
  //     const tempUser = await AuthRepository.saveTempUser(tempUserData);

  //     // 6. Return a success response with the generated OTP if the process is successful.
  //     if (!tempUser) {
  //       return next(ApiError.badRequest());
  //     }

  //     // 7. Send a Otp email to the user.

  //     // sending success response
  //     return customResponse(res, 200, "otp send successful");
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // static async verifyOtp(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     // 1. Validate the request body to ensure it contains a valid email and OTP.
  //     const result = await verifyOtpSchema.validateAsync(req.body);
  //     const { email, otp } = result;

  //     // 2. Find the temporary user data associated with the provided email and OTP.
  //     const tempUser = await AuthRepository.findTempUserByEmail({ email, otp });

  //     // 4. Check if a valid temporary user was found. If not, return an unauthorized error.
  //     if (!tempUser) {
  //       return next(ApiError.badRequest());
  //     }

  //     // 6. If the OTP is still valid, return a success response.
  //     if (tempUser.expirationTime > new Date()) {
  //       // sending success response
  //       return customResponse(res, 200, "OTP verification successful");
  //     } else {
  //       // 7. If the OTP has expired, return an unauthorized error.
  //       return next(ApiError.customError(419, "OTP has expired"));
  //     }
  //   } catch (error) {
  //     // 8. Handle and pass on any errors that may occur during this process.
  //     next(error);
  //   }
  // }

  // Initiate the password reset process by sending a password reset link to the user's email.
  static async forgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate the request body to ensure it contains a valid email.
      const result = await emailSchema.validateAsync(req.body);
      const { email } = result;

      // 2. Check if the user exists.
      const user = await UserRepository.findUserByEmail(email);

      if (!user) {
        // 3. Return an error response if the email is not found.
        return next(ApiError.notFound());
      }

      // 4. Remove the password from the user object to avoid exposing it.
      // const { password, resetPasswordToken , ...restUserDetails } = user;

      // 5. Generate a password reset token (JWT).
      const JWT = generateJWT(user.id, "900s"); // 900 seconds for 15 minutes.

      user.resetPasswordToken = JWT;
      // user.password = password

      const saveUser = await UserRepository.saveUser(user);
      
      if (saveUser) {
        // 6. Construct the password reset link.
        const url = `${process.env.clientUrl}/api/auth/set-password/${JWT}`;

        logger.info(url);

        // 7. Send Email a password reset email to the user.
        // Example: sendPasswordResetEmail(user.email, url);

        // 8. Return a success response.
        return customResponse(res, 200,
          "A password reset link has been sent to your email address. Please check your inbox." );
      }
    } catch (error) {
      // 9. Handle and pass on any errors that may occur during this process.
      next(error);
    }
  }

  //Set a new password for a user based on a valid email and a password reset link to the user's email.
  static async setPassword(req: Request, res: Response, next: NextFunction) {
    try {

      // 2. Validate the new password from the request body.
      const { password } = await passwordSchema.validateAsync(req.body);

      const { token } = req.params;      

      const { id } = verifyJWT(token as string)      

      // 4. Check if the user exists and the provided token matches.
      const user = await UserRepository.findUserByUserId(Number(id));

      if (!user ) { 
        return next(ApiError.notFound());
      }

      if(user.resetPasswordToken !== token){
        return next(ApiError.forbidden());
      }

      // 3. Hash the new password for security.
      const hashPassword = await hash(password);

      // 5. Update the user's password and reset the token.
      user.password = hashPassword;
      user.resetPasswordToken = "";

      // 6. Save the updated user data.
      const saveUser = await UserRepository.saveUser(user);

      if (!saveUser) {
        // 7. Handle a bad request if the user data couldn't be saved.
        return next(ApiError.badRequest());
      }

      // 8. Password update was successful.
      return customResponse(res, 200,"Your password has been successfully updated.");
    } catch (error) {
      // 10. Handle and pass on any errors that may occur during this process.
      next(error);
    }
  }

}
