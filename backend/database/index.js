import { MongoClient} from 'mongodb';
import { mongodb_uri, mongodb_database_name } from '../configuration/secret';
const dbCollections = {};

const client = new MongoClient(mongodb_uri);
await client.connect();
const collection = client.db(mongodb_database_name).collection("users");
dbCollections.users = collection;
dbCollections.passwordCodes = client.db(mongodb_database_name).collection("passwordCodes");
dbCollections.profiles = client.db(mongodb_database_name).collection("profiles");
export default dbCollections;