import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

enum device {
    'android',
    'ios',
    'web'
}

export class LoginDTO {
    @ApiProperty()
    @IsNotEmpty()
    mobile_no: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    device_token: string

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(device)
    device: device

    current_location: {
        type: string
        current_location: number[]
    }

    access_token: string
}