require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const PORT = 5000;
const startServer = async () =>{
  try{
    await connectDB();
    app.listen(PORT,()=>{
      console.log(`Server listening on ${PORT}`);
    });
  }
  catch(err){
    console.error(err);
  }
}
startServer();

