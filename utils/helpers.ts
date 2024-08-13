import { cryptoConstants } from '../config/constants';
import * as CryptoJS from "crypto-js";
import mongoose from 'mongoose';

export const strSlug = (string: string) => {
    return string
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[-]+/g, "-")
        .replace(/[^\w-]+/g, "");
}

export const BSONifyKeys = (object: object, idKeys: string[]) => {
    let returnObject = {};
    Object.entries(object).forEach(([key, value]) => {
        if (idKeys.includes(key)) returnObject[key] = new mongoose.Types.ObjectId(value);
        else returnObject[key] = value;
    })
    return returnObject;
}

export const encrypt = (string: string): string => {
    var key = CryptoJS.enc.Utf8.parse(cryptoConstants.secret);
    var iv = CryptoJS.enc.Utf8.parse(cryptoConstants.iv);
    var ciphertext = CryptoJS.AES.encrypt(string, key, { iv: iv }).toString();
    return ciphertext;
}

export const decrypt = (string: string): any => {
    var key = CryptoJS.enc.Utf8.parse(cryptoConstants.secret);
    var iv = CryptoJS.enc.Utf8.parse(cryptoConstants.iv);
    var bytes = CryptoJS.AES.decrypt(string, key, { iv: iv });
    var base64Token = bytes.toString(CryptoJS.enc.Utf8);
    return base64Token;
}