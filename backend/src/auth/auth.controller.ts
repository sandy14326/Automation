import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import * as path from 'path';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password?: string; fullName?: string; phoneNumber?: string }
  ) {
    if (!body.email || !body.password || !body.fullName) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide all required fields: email, password, and fullName.',
      };
    }
    return this.authService.register(body.email, body.password, body.fullName, body.phoneNumber);
  }

  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string }
  ) {
    if (!body.email || !body.password) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide both email and password.',
      };
    }
    return this.authService.login(body.email, body.password);
  }

  @Post('otp/send')
  async sendOtp(
    @Body() body: { phoneNumber: string }
  ) {
    if (!body.phoneNumber) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide a registered phone number.',
      };
    }
    return this.authService.sendOtp(body.phoneNumber);
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() body: { phoneNumber: string; code: string }
  ) {
    if (!body.phoneNumber || !body.code) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide both your phone number and the 6-digit verification code.',
      };
    }
    return this.authService.verifyOtp(body.phoneNumber, body.code);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userPayload = req.user;
    const profile = await this.authService.findUserById(userPayload.sub);
    return {
      statusCode: HttpStatus.OK,
      user: profile,
    };
  }

  @Post('logout')
  async logout() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully. Clear your token client-side.',
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string }
  ) {
    if (!body.email) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please provide your email address.',
      };
    }
    console.log(`[Auth Service] Simulating password reset email request for: ${body.email}`);
    return {
      statusCode: HttpStatus.OK,
      message: `If the email exists, a password reset link has been dispatched to ${body.email}.`,
    };
  }

  @Get('export-csv')
  async exportCsv(@Res() res: Response) {
    try {
      const csvData = await this.authService.exportUsersToCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
      return res.status(HttpStatus.OK).send(csvData);
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate CSV export.',
        error: e.message,
      });
    }
  }

  @Get('database-download')
  downloadDatabase(@Res() res: Response) {
    const dbPath = path.resolve(process.cwd(), '../database.sqlite');
    return res.sendFile(dbPath);
  }
}
