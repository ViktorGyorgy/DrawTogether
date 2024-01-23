import dbCollections from './index.js';

export async function deleteCode(username){
    return dbCollections.passwordCodes.deleteOne({_id: username});
}

export async function findByCode(code){
    return dbCollections.passwordCodes.findOne({'code': code})
}

export async function insertCode(username, code){
    return dbCollections.passwordCodes.insertOne({_id: username, 'code': code})
}