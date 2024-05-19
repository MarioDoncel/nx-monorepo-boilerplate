import { NonEmptyArray } from '@monorepo/entities';

export namespace EmailSender {
  export type Params = {
    to: NonEmptyArray<string>;
    acc?: NonEmptyArray<string>;
    bcc?: NonEmptyArray<string>;
    subject: string;
  } & (
      | { htmlMessageBody: string; textMessageBody?: never }
      | { textMessageBody: string; htmlMessageBody?: never }
    );
  export type Result = {
    success: boolean;
    errorMessage?: string;
  };
}
export interface EmailSender {
  send: (params: EmailSender.Params) => Promise<EmailSender.Result>;
}

