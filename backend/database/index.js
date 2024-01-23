import { MongoClient} from 'mongodb';
import { mongodb_uri } from '../configuration/secret';
const dbCollections = {};

const client = new MongoClient(mongodb_uri);
await client.connect();
const collection = client.db("allamvizsga").collection("users");
dbCollections.users = collection;
dbCollections.passwordCodes = client.db("allamvizsga").collection("passwordCodes");
dbCollections.profiles = client.db("allamvizsga").collection("profiles");
export default dbCollections;