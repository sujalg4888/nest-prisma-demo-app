/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /** Validates a user's credentials and returns the user object if valid.
   * @param email - The email of the user attempting to log in.
   * @param password - The password provided by the user.
   * @returns A Promise that resolves to the user object if the credentials are valid or `null` if the user is not found or the password is incorrect.
   * @throws {@link NotFoundException} - If the user is not found.
   * @throws {@link UnauthorizedException} - If the password is incorrect.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Error validating user credentials');
    }
  }

  /** Generates a JWT token for a user and returns it.
   * @param user - The user object for whom the JWT token is being generated.
   * @returns An object containing the generated JWT token under the `access_token` property.
   */
  async login(user: any) {
    try {
      const payload = { sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /** Registers a new user by creating a new record in the database with a hashed password.
   * @param name - The name of the new user.
   * @param email - The email of the new user.
   * @param pass - The plain-text password of the new user.
   * @returns The newly created user object.
   * @throws {@link BadRequestException} - If a user with the provided email already exists.
   */
  async register(name: string, email: string, pass: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(pass, salt);

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      const payload = { sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
