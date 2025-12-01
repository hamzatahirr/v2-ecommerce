import { IsString, IsUUID, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

export class StartConversationDto {
  @IsUUID()
  @IsNotEmpty()
  sellerId!: string;
}

export class SendMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @IsOptional()
  file?: Express.Multer.File;
}

export class GetConversationDto {
  @IsUUID()
  conversationId!: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 50;
}

export class MarkAsReadDto {
  @IsUUID()
  conversationId!: string;
}