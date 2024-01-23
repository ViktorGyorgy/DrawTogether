import dbCollections from './index.js';

export async function initalizeForUser(username){
    return dbCollections.profiles.insertOne({_id: username, "competitiveWon": 0, "votesGotten": 0, "cooperativePlayed": 0, "roundsWon": 0})
}

export async function getStats(username){
    return dbCollections.profiles.findOne({_id: username});
}

export async function increaseVotesGotten(username){
    return dbCollections.profiles.updateOne({_id: username}, {$inc: {"votesGotten": 1}})
}

export async function increaseCompetitivesWon(username){
    return dbCollections.profiles.updateOne({_id: username}, {$inc: {"competitiveWon": 1}})
}

export async function increaseCooperativePlayed(username){
    return dbCollections.profiles.updateOne({_id: username}, {$inc: {"cooperativePlayed": 1}})
}

export async function increaseRoundsWon(username){
    return dbCollections.profiles.updateOne({_id: username}, {$inc: {"roundsWon": 1}})
}