import {
    IsEmail,
    IsOptional,
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    Matches,
    IsArray,
} from 'class-validator';
import { baseInterface } from '../../base/base.model'
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

enum gender {
    'male',
    'female',
    'none'
}

export enum role {
    USER = 'user',
    VENDOR = 'vendor',
    SALON = 'salon',
    ARIST = 'artist',
    ADMIN = 'super-admin'
}

export class UserDTO extends baseInterface {

    _id: string

    @ApiProperty()
    @IsNotEmpty()
    role: role

    @ApiPropertyOptional()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    name: string

    @ApiPropertyOptional()
    @IsEmail()
    email: string

    username: string

    image_url?: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    mobile_no?: string

    @ApiPropertyOptional({ enum: gender })
    @IsOptional()
    @IsEnum(gender)
    gender: gender

    @ApiPropertyOptional()
    @IsOptional()
    country?: string
    
    @ApiPropertyOptional()
    @IsOptional()
    city?: string

    @ApiPropertyOptional()
    @IsOptional()
    state?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Matches(
        /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,150}$/,
        { message: 'Password should contain at least one uppercase letter, one lowercase letter, one number and one special character.' }
    )
    password?: string

    online_status?: boolean

    @ApiPropertyOptional()
    @IsOptional()
    latitude?: number

    @ApiPropertyOptional()
    @IsOptional()
    longitude?: number

    payment_active?: boolean

    email_verified?: boolean

    mobile_no_verified?: boolean

    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false
    })
    image: Express.Multer.File

}