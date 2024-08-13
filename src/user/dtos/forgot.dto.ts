import {
    IsEmail,
    IsNotEmpty
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class ForgotDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string
}