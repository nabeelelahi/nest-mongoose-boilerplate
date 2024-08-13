import { storageConstants } from "config/constants";
import { v2 as cloudinary } from "cloudinary";
import * as streamifier from 'streamifier';


if (storageConstants.mode === 'cloudinary') {
    cloudinary.config({
        cloud_name: process.env.STORAGE_CLOUD_NAME,
        api_key: process.env.STORAGE_PUBLIC_KEY,
        api_secret: process.env.STORAGE_SECRET_KEY // Click 'View Credentials' below to copy your API secret
    });
}

export class FileUpload {


    static async upload(file: Express.Multer.File): Promise<string> {
        let mode = storageConstants.mode;
        if (mode === 'local') {
            return this.localSingle(file)
        }
        else if (mode === 'cloudinary') {
            return (await this.cloudinarySingle(file)).secure_url
        }
    }

    static async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
        let mode = storageConstants.mode;
        if (mode === 'local') {
            return this.localMultple(files)
        }
        else if (mode === 'cloudinary') {
            return await this.cloudinaryMultiple(files)
        }
    }

    static localSingle(file: Express.Multer.File) {
        return `uploads/${file.filename}`
    }

    static localMultple(files: Express.Multer.File[]) {
        return files.map(file => `uploads/${file.filename}`)
    }

    static cloudinarySingle = async (file: Express.Multer.File): Promise<any> => {
        return await new Promise((resolve, reject) => {
            let cld_upload_stream = cloudinary.uploader.upload_stream(
                {
                    folder: "ez_beauty"
                },
                (error: any, result: any) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
        });
    };

    static cloudinaryMultiple = async (files: Express.Multer.File[]): Promise<any> => {
        return await Promise.all(files.map(async file => (await this.cloudinarySingle(file)).secure_url))
    };


}