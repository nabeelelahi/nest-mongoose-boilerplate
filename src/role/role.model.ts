import { Schema } from "mongoose";
import { MongooseModule } from '@nestjs/mongoose';
import baseModel, { baseInterface } from "../base/base.model";

export interface RoleDTO extends baseInterface {
    id: string
    name: string
}

export const name = 'roles'

export const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    ...baseModel
});

export default MongooseModule.forFeature([{ name, schema }])