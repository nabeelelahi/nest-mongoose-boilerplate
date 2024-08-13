import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class SetPaswordDTO {
    @ApiProperty()
    @ApiProperty()
    @IsNotEmpty()
    password: string
}