import mongoose from "mongoose";
import { databaseConstants } from "../config/constants";
export const dbUrl = databaseConstants.url;


export default async () => {
    await mongoose.connect(dbUrl);
    return mongoose;
} 