import { Controller, Post, Get, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService, Contact } from './whatsapp.service';

@Controller('api/v1/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('webhooks/whatsapp')
  async handleIncomingWebhook(
    @Body() body: any,
    @Res() res: Response,
  ) {
    const sender = body.From;
    const textContent = body.Body?.trim();

    if (!sender || !textContent) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid webhook payload parameters.',
      });
    }

    try {
      const replyMessage = await this.whatsappService.processUserResponse(sender, textContent);
      res.set('Content-Type', 'text/xml');
      const twiml = `
        <Response>
          <Message>${replyMessage}</Message>
        </Response>
      `.trim();
      return res.status(HttpStatus.OK).send(twiml);
    } catch (error) {
      res.set('Content-Type', 'text/xml');
      const errorTwiml = `
        <Response>
          <Message>An error occurred processing your request. Please try again later.</Message>
        </Response>
      `;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorTwiml);
    }
  }

  @Get('contacts')
  async getContacts(): Promise<Contact[]> {
    return this.whatsappService.getSyncedContacts();
  }

  @Post('contacts/sync')
  async syncContacts(@Body() body: { phoneNumber: string }) {
    const count = await this.whatsappService.triggerContactSync(body.phoneNumber);
    return {
      message: 'Contacts synced successfully',
      syncedCount: count,
    };
  }

  @Post('broadcast')
  async broadcast(@Body() body: { message: string }) {
    const result = await this.whatsappService.sendBulkBroadcast(body.message);
    return {
      message: 'Broadcast dispatched successfully',
      details: result,
    };
  }
}
