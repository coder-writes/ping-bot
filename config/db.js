import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MAX_TRIES = 5;
const RETRY_DELAY = 2000;

const connectDb = async () =>{
    let attempts = 0;

    while(attempts< MAX_TRIES){
        try{
            const connect = await mongoose.connect(process.env.MONGO_URI);
            // console.log(connect);
            console.log(`Database connected: ${connect.connection.host}`);
            break;
        }catch(error){
            attempts++;
            console.error(`Error connecting to Database:, Attempt: ${attempts} of ${MAX_TRIES}`);
            
            if(attempts >= MAX_TRIES){
                console.error("Max connection attempts reached. Exiting...");
                process.exit(1);
            }

            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    };
}

export default connectDb;