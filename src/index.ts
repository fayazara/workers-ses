import { AwsClient } from "aws4fetch";

export interface SESClientConfig {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
}

export interface Destination {
  ToAddresses?: string[];
  CcAddresses?: string[];
  BccAddresses?: string[];
}

export interface Content {
  Data: string;
  Charset?: string;
}

export interface Body {
  Text?: Content;
  Html?: Content;
}

export interface Message {
  Subject: Content;
  Body: Body;
}

export interface SendEmailCommandInput {
  Source: string;
  Destination: Destination;
  Message: Message;
  ReplyToAddresses?: string[];
  ReturnPath?: string;
  SourceArn?: string;
  ReturnPathArn?: string;
  Tags?: Array<{ Name: string; Value: string }>;
  ConfigurationSetName?: string;
}

export interface SendTemplatedEmailCommandInput {
  Source: string;
  Destination: Destination;
  Template: string;
  TemplateData: string;
  ReplyToAddresses?: string[];
  ReturnPath?: string;
  SourceArn?: string;
  ReturnPathArn?: string;
  Tags?: Array<{ Name: string; Value: string }>;
  ConfigurationSetName?: string;
}

export interface SendEmailResponse {
  MessageId: string;
}

export interface SESError extends Error {
  code: string;
  statusCode: number;
  requestId?: string;
}

export class SESClient {
  private awsClient: AwsClient;
  private region: string;

  constructor(config: SESClientConfig) {
    this.region = config.region;
    this.awsClient = new AwsClient({
      accessKeyId: config.credentials.accessKeyId,
      secretAccessKey: config.credentials.secretAccessKey,
      sessionToken: config.credentials.sessionToken,
      service: "email",
      region: this.region,
    });
  }

  private getEndpoint(): string {
    return `https://email.${this.region}.amazonaws.com/`;
  }

  private async makeRequest(
    action: string,
    params: Record<string, any>,
  ): Promise<any> {
    const body = new URLSearchParams();
    body.append("Action", action);
    body.append("Version", "2010-12-01");

    // Flatten the parameters for SES API format
    this.flattenParams(params, body);

    try {
      const response = await this.awsClient.fetch(this.getEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw await this.parseError(responseText, response.status);
      }

      return this.parseXMLResponse(responseText);
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error;
      }
      throw new Error(`SES request failed: ${error}`);
    }
  }

  private flattenParams(
    obj: any,
    formData: URLSearchParams,
    prefix = "",
  ): void {
    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null) continue;

      const paramKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(obj[key])) {
        for (const [index, item] of obj[key].entries()) {
          if (typeof item === "object") {
            this.flattenParams(
              item,
              formData,
              `${paramKey}.member.${index + 1}`,
            );
          } else {
            formData.append(`${paramKey}.member.${index + 1}`, String(item));
          }
        }
      } else if (typeof obj[key] === "object") {
        this.flattenParams(obj[key], formData, paramKey);
      } else {
        formData.append(paramKey, String(obj[key]));
      }
    }
  }

  private async parseError(
    responseText: string,
    statusCode: number,
  ): Promise<SESError> {
    try {
      // Log the raw response for debugging
      console.log('Raw error response:', responseText);
      
      // Simple XML parsing for Node.js compatibility
      const codeMatch = responseText.match(/<Code>(.*?)<\/Code>/);
      const messageMatch = responseText.match(/<Message>(.*?)<\/Message>/);
      const requestIdMatch = responseText.match(/<RequestId>(.*?)<\/RequestId>/);

      const code = codeMatch?.[1] || "UnknownError";
      const message = messageMatch?.[1] || responseText || "Unknown error occurred";
      const requestId = requestIdMatch?.[1];

      const error = new Error(message) as SESError;
      error.code = code;
      error.statusCode = statusCode;
      if (requestId) error.requestId = requestId;
      error.name = "SESError";

      return error;
    } catch (error_) {
      console.log('Failed to parse error response:', error_);
      console.log('Raw response text:', responseText);
      
      const error = new Error(`SES Error (Status: ${statusCode}): ${responseText}`) as SESError;
      error.code = "ParseError";
      error.statusCode = statusCode;
      error.name = "SESError";
      return error;
    }
  }

  private parseXMLResponse(responseText: string): any {
    try {
      // Simple XML parsing for Node.js compatibility
      const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/);
      if (messageIdMatch?.[1]) {
        return { MessageId: messageIdMatch[1] };
      }

      return {};
    } catch (error_) {
      throw new Error(`Failed to parse XML response: ${error_}`);
    }
  }

  async send(
    command: SendEmailCommand | SendTemplatedEmailCommand,
  ): Promise<SendEmailResponse> {
    if (command instanceof SendEmailCommand) {
      return await this.sendEmail(command.input);
    } else if (command instanceof SendTemplatedEmailCommand) {
      return await this.sendTemplatedEmail(command.input);
    }
    throw new Error("Invalid command type");
  }

  private async sendEmail(
    input: SendEmailCommandInput,
  ): Promise<SendEmailResponse> {
    const params: Record<string, any> = {
      Source: input.Source,
    };

    // Handle destinations
    if (input.Destination.ToAddresses?.length) {
      params["Destination.ToAddresses"] = input.Destination.ToAddresses;
    }
    if (input.Destination.CcAddresses?.length) {
      params["Destination.CcAddresses"] = input.Destination.CcAddresses;
    }
    if (input.Destination.BccAddresses?.length) {
      params["Destination.BccAddresses"] = input.Destination.BccAddresses;
    }

    // Handle message
    params["Message.Subject.Data"] = input.Message.Subject.Data;
    if (input.Message.Subject.Charset) {
      params["Message.Subject.Charset"] = input.Message.Subject.Charset;
    }

    if (input.Message.Body.Text) {
      params["Message.Body.Text.Data"] = input.Message.Body.Text.Data;
      if (input.Message.Body.Text.Charset) {
        params["Message.Body.Text.Charset"] = input.Message.Body.Text.Charset;
      }
    }

    if (input.Message.Body.Html) {
      params["Message.Body.Html.Data"] = input.Message.Body.Html.Data;
      if (input.Message.Body.Html.Charset) {
        params["Message.Body.Html.Charset"] = input.Message.Body.Html.Charset;
      }
    }

    // Handle optional parameters
    if (input.ReplyToAddresses?.length) {
      params["ReplyToAddresses"] = input.ReplyToAddresses;
    }
    if (input.ReturnPath) {
      params.ReturnPath = input.ReturnPath;
    }
    if (input.ConfigurationSetName) {
      params.ConfigurationSetName = input.ConfigurationSetName;
    }

    return await this.makeRequest("SendEmail", params);
  }

  private async sendTemplatedEmail(
    input: SendTemplatedEmailCommandInput,
  ): Promise<SendEmailResponse> {
    const params: Record<string, any> = {
      Source: input.Source,
      Template: input.Template,
      TemplateData: input.TemplateData,
    };

    // Handle destinations
    if (input.Destination.ToAddresses?.length) {
      params["Destination.ToAddresses"] = input.Destination.ToAddresses;
    }
    if (input.Destination.CcAddresses?.length) {
      params["Destination.CcAddresses"] = input.Destination.CcAddresses;
    }
    if (input.Destination.BccAddresses?.length) {
      params["Destination.BccAddresses"] = input.Destination.BccAddresses;
    }

    // Handle optional parameters
    if (input.ReplyToAddresses?.length) {
      params["ReplyToAddresses"] = input.ReplyToAddresses;
    }
    if (input.ReturnPath) {
      params.ReturnPath = input.ReturnPath;
    }
    if (input.ConfigurationSetName) {
      params.ConfigurationSetName = input.ConfigurationSetName;
    }

    return await this.makeRequest("SendTemplatedEmail", params);
  }
}

// Command classes that match AWS SDK pattern
export class SendEmailCommand {
  constructor(public input: SendEmailCommandInput) {}
}

export class SendTemplatedEmailCommand {
  constructor(public input: SendTemplatedEmailCommandInput) {}
}

export async function sendEmail(
  client: SESClient,
  params: SendEmailCommandInput,
): Promise<SendEmailResponse> {
  const command = new SendEmailCommand(params);
  return await client.send(command);
}

export async function sendTemplatedEmail(
  client: SESClient,
  params: SendTemplatedEmailCommandInput,
): Promise<SendEmailResponse> {
  const command = new SendTemplatedEmailCommand(params);
  return await client.send(command);
}
