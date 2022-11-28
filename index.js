const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config();
const jwt = require('jsonwebtoken');


const userNmae = process.env.DB_ADMIN_USER;
const pass = process.env.DV_ADMIN_PSS

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_ADMIN_USER}:${process.env.DV_ADMIN_PSS}@cluster0.pkgzac3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function jwtVerify(req,res,next){
    const getToken = req.headers.auhurizaton
    if(!getToken){
      return  res.status(401).send({message:"Unauthorized Access"})
    }
    const token = getToken?.split(" ")[1]
    jwt.verify(token,process.env.JWT_TOKEN,function(err,decoded){
        if(err){
            return  res.status(401).send({message:"Unauthorized Access from 2nd stape"})
        }

        req.decoded = decoded
        // console.log(decoded)
        next()
    })
   
}


async function run() {
    try {
        const usersCollection = client.db("ph-hero-mart").collection("allUser")
        const productCategory = client.db("ph-hero-mart").collection("productCategory")
        const productsCollection = client.db("ph-hero-mart").collection("resaleProduct")
        const bookingsCollection = client.db("ph-hero-mart").collection("bookings")

        // Product Category Loaded
        app.get("/product-categories", async (req, res) => {
            const query = {}
            const result = await productCategory.find().toArray()
            res.send(result)
        })


        // api for getProduct
        app.get("/products/:id", async (req, res) => {
            const categoryId = req.params.id;
            const query = { prductCategoryId: categoryId }
            const result = await productsCollection.find(query).toArray()
            res.send(result)

        })
    
          // API for get My products using emil query
          app.get("/get-products", async(req,res)=>{
            const email = req.query.email;
            const query = {sellerEmail : email}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
          })

        // API for update 
          app.put("/product-status/:id", async(req,res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set :{
                    productStatus : "sold"
                }
            }

            const result = await productsCollection.updateOne(filter,updateDoc,options)
            res.send(result)

          })

          // API for Delete Product
          app.delete("/delete-products/:id", async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await productsCollection.deleteOne(query)
            res.send(result)
          })


        // api for add products
        app.post("/add-product", async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

          // API for Get Bookings
          app.get("/bookings", async(req,res)=>{
            const email = req.query.email 
            // console.log(email);
            const query ={email:email}
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
          })


        // POST API for Bookings
        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })

        // get user api
        app.get("/users",jwtVerify,async(req,res)=>{
            const email = req.query.email           
            const decodedEmail= req.decoded.email;
            console.log(email,decodedEmail);
            if(decodedEmail !== email){
                return res.status(403).send({message:"forbiden access"})
            }
            const query={email:decodedEmail}
            const result = await usersCollection.findOne(query)
            console.log(result)
            res.send(result)

        })


        // User API 
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: "1d" })

            res.send({result,"token":token})
        })

        // api for make admin role
        app.put("/user-admin/:id",jwtVerify, async(req,res)=>{
           const decodedEmail = req.decoded.email
           const query ={email:decodedEmail}
           const admin = await usersCollection.findOne(query)
           if(admin.userCategory !== "Admin"){
            return res.status(401).send({message:"Unauthorized Access"})
           }
            const id = req.params.id 
            const filter = {_id:ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set:{
                    userCategory:"Admin"
                }

            }
            const result= await usersCollection.updateOne(filter,updateDoc,options)
            res.send(result)
        })


        // api for user delete
        app.delete("/users/:id", async(req,res)=>{
            const id = req.params.id 
            const query = {_id:ObjectId(id)}
            const result = await usersCollection.deleteOne(query)
            res.send(result) 
        })
      
        // API for get all Byer
        app.get("/all-buyers", async(req,res)=>{
            const query = {userCategory: "Buyer"}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        // API for get All seller
        app.get("/all-sellers", async(req,res)=>{
            const query ={userCategory:"Seller"}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        // Api for get all Admin
        app.get("/all-admin", async(req,res)=>{
            const query ={userCategory:"Admin"}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
    }
    finally {

    }
}

run().catch(err => console.log(err))


app.get("/", (req, res) => {
    res.send("Server is running successful")
})


app.listen(port, () => {
    console.log(`server is running on : ${port}`)
})