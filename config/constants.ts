import 'dotenv/config'
import { storage } from './multer'


export const PORT = process.env.PORT
export const jwtConstants = { secret: process.env.GWT_SECRET }
export const bycryptConstants = { salt: process.env.BYCRYPT_SALT_ROUND }
export const cryptoConstants = { secret: process.env.AES_SECRET, iv: process.env.AES_IV }
export const databaseConstants = { url: process.env.DATABASE_CONNECTION_STRING }
export const verificationConstant = { mode: process.env.VERIFICATION_MODE || 'email', codeLength: process.env.VERIFICATION_CODE_LENGTH || 4 }
export const storageConstants = {
    multer: { storage }, mode: process.env.STORAGE_MODE || 'local',
}