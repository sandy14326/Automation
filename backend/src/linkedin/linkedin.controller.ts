import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';

@Controller('api/v1/linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Get('accounts')
  async getAccounts() {
    return this.linkedinService.getAccounts();
  }

  @Post('accounts')
  async addAccount(@Body() body: any) {
    return this.linkedinService.addAccount(body);
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id') id: string) {
    return this.linkedinService.deleteAccount(id);
  }

  @Post('accounts/:id/active')
  async setActiveAccount(@Param('id') id: string) {
    return this.linkedinService.setActiveAccount(id);
  }
}
