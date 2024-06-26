const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId  } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;



//middle-wares
app.use(cors());

app.use(express.json());



const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmpng5e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db('newproductdb').collection('newproduct');

    const brandCollection = client.db('bname').collection('bname');
    const cartCollection  = client.db('mobileCartbd').collection('mobileCart');

    app.get( '/bname', async(req,res)=>{
     const cursor = brandCollection.find();
     const result = await cursor.toArray();
     res.send(result);
    })

      app.get('/product/:brand', async(req , res)=>{
        
        const brand = req.params.brand;
        const query = {brand:brand};
        
        const products = await productCollection.find(query).toArray();
        
       
        const result = {
          brand: brand,
          products: products
        };
        res.send(result)
      }),



    //  all products

      app.get('/products', async(req,res)=>{
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        
        res.send(result);
        // console.log(result)
      })

    // one product
    
    app.get('/products/:id', async(req,res)=>{
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id)}
      // console.log(query);
      const result = await productCollection.findOne(query);
      
      res.send( result);
      // console.log( 'one id result', result);
      
    });
      
      //update a product 
      app.put('/product/:id', async(req,res)=>{
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const options =   {upsert : true}
          const updatedProduct = req.body;
          const product ={
            $set:{
              name : updatedProduct.name,
              photo : updatedProduct.photo   ,
              rating : updatedProduct.rating,
              type : updatedProduct.type,
              description : updatedProduct.description,
              price : updatedProduct.price,
              brand : updatedProduct.brand,
            }
          }
          const result = await productCollection.updateOne(filter , product , options);
          res.send(result);
      }) 


    app.post('/product', async(req , res)=>{
        const newProduct = req.body;
        // console.log(newProduct); 
        const result = await productCollection.insertOne(newProduct);
        res.send(result);

    })

    //  sending data to my cart 
    app.post('/cart', async(req,res)=>{
      const addCartProduct = req.body;
      const addProduct = await cartCollection.insertOne(addCartProduct);
      res.send(addProduct);
      // console.log(addProduct);

    });

    // cart data get 
    app.get('/cart-data', async(req,res)=>{
      const cartData = cartCollection.find();
        const cart = await cartData.toArray();
        res.send(cart);
    });
    // delete from cart 
    app.delete('/cart-data/:id',async(req,res)=>{
      const id = req.params.id;
      const query= {_id : new ObjectId(id)}
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("gadgets server is runnign ");
  });

app.listen(port, () => {
  console.log(`server is runnig on port:${port}`);
});
