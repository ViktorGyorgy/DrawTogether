import dbCollections from './index.js';

export async function getHashedPasswordOfUser(username){
    const userEntry = await dbCollections.users.findOne({_id: username});
    return userEntry.passwordHashed;
}

export function getByEmail(email){
    return dbCollections.users.findOne({'email': email})
}

export function updatePassword(username, passwordHashed){
    return dbCollections.users.updateOne({_id: username}, {$set: {'passwordHashed': passwordHashed}})
}

export async function saveUser(username, passwordHashed, email){
    await dbCollections.users.insertOne({_id: username, 'passwordHashed': passwordHashed, 'email': email});
}