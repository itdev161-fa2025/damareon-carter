import { connect } from 'mongoose';
import config from 'config';

const db = config.get('mongoURI');

const connectDatabase = async () =>
{
    try
    {
        await connect(db, { useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    }
    catch (error)
    {
        console.error(error.message);
        process.exit(1);
    }
}

export default connectDatabase;