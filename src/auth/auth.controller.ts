import { Controller, Post, Get } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  logIn(@Body() dto: AuthDto) {
    return this.authService.logIn(dto);
  }

  @Post('signup')
  signUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }

  @Get('profile')
  getProfile() {
    this.authService.getProfile();
  }
}
