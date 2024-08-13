import mongoose, { Schema } from "mongoose";
import { MongooseModule } from '@nestjs/mongoose';
import baseModel from '../../base/base.model'
import { role } from "./user.dto";
import { bycryptConstants } from "../../../config/constants";
import * as bcrypt from 'bcrypt';

export const name = 'users'

export const schema = new Schema({
    role: {
        type: String,
        enum: [role.ADMIN, role.SALON, role.VENDOR, role.USER],
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        // required: true
    },
    completion_step: {
        type: Number,
        default: 1
        // required: true
    },
    image_url: {
        type: String,
        default: 'https://res.cloudinary.com/dxyb4xgcs/image/upload/v1723172250/user-placeholder_hhrfnj.png'
    },
    mobile_no: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'none'],
    },
    age: {
        type: Number
    },
    online_status: {
        type: Boolean,
        default: false
    },
    payment_active: {
        type: Boolean,
        default: false
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    email_verified_at: {
        type: Date,
    },
    phone_verified: {
        type: Boolean,
        default: false
    },
    phone_verified_at: {
        type: Date,
    },
    verification_code: {
        type: String,
        default: null
    },
    reset_password_token: {
        type: String,
        default: null
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    current_location: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        }
    },
    address: {
        house: {
            type: String
        },
        street: {
            type: String
        },
        building: {
            type: String
        },
        landmark: {
            type: String
        },
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    salon_name:{
        type: String
    },
    salon_email:{
        type: String
    },
    salon_phone:{
        type: String
    },
    description:{
        type: String
    },
    offered_at:{
        type: Array<string>
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    ...baseModel
});


schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    //hash password with bcryptjs
    this.password = await bcrypt.hash(this.password, +bycryptConstants.salt);
  });

export const User = mongoose.model(name, schema);
export default MongooseModule.forFeature([{ name, schema }])