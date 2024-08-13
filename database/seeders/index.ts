import role from './roles';
import user from './admin';
import connect from "../config";

connect().then(async mongoose => {
    await role(mongoose)
    await user(mongoose)
    process.exit();
})