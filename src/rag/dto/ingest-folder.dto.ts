import { IsString, IsOptional } from 'class-validator';

export class IngestFolderDto {
  @IsOptional()
  @IsString()
  folderPath?: string;
}
