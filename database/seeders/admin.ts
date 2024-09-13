import { schema, name } from "../../src/user/dtos/user.model";
import { schema as roleSchema, name as roleName } from "../../src/role/role.model";
import * as bcrypt from 'bcrypt';
import { bycryptConstants } from "../../config/constants";

export default async (mongoose:any) => {
    const model = mongoose.model(name, schema);
    const roleModel = mongoose.model(roleName, roleSchema);
    let data = [
        {
            role: 'super-admin',
            name: 'Super Admin',
            university_name: 'Super Admin',
            slug: 'super-admin',
            email: 'admin@admin.com',
            mobile_no: '03123456789',
            password: await bcrypt.hash('Admin@123$', +bycryptConstants.salt),
            username: 'super-admin',
            email_verified: true,
            mobile_no_verified: true,
            created_at: new Date(),
        }
    ]
    try {
        await model.findOneAndDelete({ email: 'admin@admin.com' })
        let records = await model.insertMany(data);
        console.log('admin', records)
    }
    catch (err) {
        console.log('Error while seeding admin')
        console.log('Error...', err)
    }
}
