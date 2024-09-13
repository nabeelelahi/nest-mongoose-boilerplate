import {
    IsEmail,
    IsNotEmpty,
    MinLength,
    MaxLength
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { verificationConstant } from 'config/constants';

class VerifyCodeEmailDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(4)
    @MinLength(4)
    code: string
};


class VerifyCodMobileeDTO {
    @ApiProperty()
    @IsNotEmpty()
    mobile_no: string
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(6)
    code: string
}


const verifyCodeDTO = verificationConstant.mode == 'email' ? VerifyCodeEmailDTO : VerifyCodMobileeDTO

export class VerifyCodeDTO extends verifyCodeDTO { };