const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config();


const userNmae = process.env.DB_ADMIN_USER;
const pass = process.env.DV_ADMIN_PSS

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_ADMIN_USER}:${process.env.DV_ADMIN_PSS}@cluster0.pkgzac3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const productCategory =client.db("ph-hero-mart").collection("productCategory")
        const productCollection =client.db("ph-hero-mart").collection("resaleProduct")
        const UssersCollection =client.db("ph-hero-mart").collection("allUser")
       
       app.get("/product-categories",async(req,res)=>{
            const query = {}
            const result= await productCategory.find().toArray()
            res.send(result)
       })
    }
    finally{

    }
}

run().catch(err=>console.log(err))


app.get("/",(req,res)=>{
    res.send("Server is running successful")
})


app.listen(port,()=>{
    console.log(`server is running on : ${port}`)
})