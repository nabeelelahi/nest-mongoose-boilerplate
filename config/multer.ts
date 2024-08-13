import { diskStorage, memoryStorage } from 'multer';
import { strSlug } from '../utils/helpers';
import { extname, resolve } from 'path';

export const storage = process.env.STORAGE_MODE === 'local' ?
    diskStorage({
        destination: (req, file, cb) => {
            cb(null, resolve(__dirname, '..') + "/public/uploads");
        },
        filename: (req, file, cb) => {
            const name = strSlug(file.originalname.split('.')[0]);
            const extension = extname(file.originalname);
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            cb(null, `${name}-${randomName}${extension}`);
        },
    })
    :
    memoryStorage()