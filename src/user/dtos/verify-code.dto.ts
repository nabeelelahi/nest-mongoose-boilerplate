import {
    IsEmail,
    IsNotEmpty,
    MinLength,
    MaxLength
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class VerifyCodeDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(4)
    code: string
}