import { z } from 'zod';
import { EmailSender } from '../email-sender';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const envSchema = z.object({
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_EMAIL_REGION: z.string(),
  EMAIL_FROM_ADDRESS: z.string(),
});
export class EmailSenderSes implements EmailSender {
  client: SESClient;
  envs: z.infer<typeof envSchema>;
  constructor() {
    this.envs = envSchema.parse(process.env);
    this.client = new SESClient({ region: this.envs.AWS_EMAIL_REGION });
  }
  async send(params: EmailSender.Params): Promise<EmailSender.Result> {
    const { to, acc, bcc, subject } = params;
    const fromAddress = this.envs.EMAIL_FROM_ADDRESS;
    try {
      const sendEmailCommand = new SendEmailCommand({
        Destination: {
          BccAddresses: bcc ?? [],
          CcAddresses: acc ?? [],
          ToAddresses: to,
        },
        Message: {
          Body: {
            ...(params.textMessageBody
              ? { Text: { Charset: 'UTF-8', Data: params.textMessageBody } }
              : {}),
            ...(params.htmlMessageBody
              ? { Html: { Charset: 'UTF-8', Data: params.htmlMessageBody } }
              : {}),
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: fromAddress,
        ReplyToAddresses: [],
      });
      await this.client.send(sendEmailCommand);
      return {
        success: true,
      };
    } catch (err: unknown) {
      // this.ExceptionCatcher.catchException({ exception: err })// TODO: Implement ExceptionCatcher
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Unknown Error',
      };
    }
  }
}
