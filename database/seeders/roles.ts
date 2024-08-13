import { schema, name } from "../../src/role/role.model";

export default async (mongoose: any) => {
    const model = mongoose.model(name, schema);
    let data = [
        {
            name: 'Super Admin',
            slug: 'super-admin',
        },
        {
            name: 'Event Organizer',
            slug: 'event-organizer',
        },
        {
            name: 'User',
            slug: 'user',
        },
    ]
    try {
        await model.deleteMany()
        let records = await model.insertMany(data);
        console.log('roles', records)
    }
    catch (err) {
        console.log('Error while seeding roles')
        console.log('Error...', err)
    }
}
