/* eslint-disable prettier/prettier */
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { ApiResponseHandler } from 'src/utils/api-response-handler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 1, ttl: 6000 } })
  @Post('login')
  async login(@Body() req) {
    try {
      const { email, password } = req;
      if (!email || !password) {
        return ApiResponseHandler.errorResponse(new BadRequestException('Email and password are required'));
      }

      const user = await this.authService.validateUser(email, password);
      if (!user) {
        return ApiResponseHandler.errorResponse(new BadRequestException('Invalid credentials'));
      }

      return ApiResponseHandler.successResponse(user, 'Login successful', 200);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }

  @Throttle({ default: { limit: 1, ttl: 6000 } })
  @Post('register')
  async register(@Body() req) {
    try {
      const { name, email, password } = req;
      if (!name || !email || !password) {
        return ApiResponseHandler.errorResponse(new BadRequestException('Name, email, and password are required'));
      }

      const newUser = await this.authService.register(name, email, password);
      return ApiResponseHandler.successResponse(newUser, 'Registration successful', 201);
    } catch (error) {
      return ApiResponseHandler.errorResponse(error);
    }
  }
}
