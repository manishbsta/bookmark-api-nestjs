import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async getProfile() {
    return { data: '' };
  }
}
