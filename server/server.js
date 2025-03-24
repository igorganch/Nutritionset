const express = require("express");
const multer = require('multer');
const jwt = require("jsonwebtoken");
const app = express();
const port = 8080;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const service = require("./service.js");
const  axios  = require("axios");
const fs = require("fs");
const cors = require('cors');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.OPEN_AI_API_KEY}`,
};

app.use(cors());

const payload = {
  model: 'gpt-4o',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: ``  },
        { type: 'image_url', image_url: { url: `` } },
      ],
    },
  ],
  max_tokens: 16384,
};

// Middleware to parse JSON
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token){
     return res.status(403).json({ message: "No token provided" });
  }
  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
      if (err){ 
        return res.status(401).json({ message: "Unauthorized" })
      }
      else if (decoded.userId !=  req.query.userId){
        return res.status(401).json({ message: "Error: Token isnt associated with the req.query.userId" })
      }
      req.user = decoded;
      next();
  });
};

/*Real Calls*/
/*API CALL - Get all products through associated through user id  URL - http://localhost:8080/api/products?userId=${userId}  */


app.get("/api/products" ,verifyToken, (req,res) =>{
  if (!req.query.userId){
      return res.status(400).json({ message: "Error: req.query.userId not defined "});
  }
  service.getAllProductsFromUser(req.query.userId).then(function(data){
    console.log(data);
    return data == null ?  res.status(401).json({message : "User has no products "}) : res.status(200).json(data) ;
  }).catch(function(err){
    return res.status(500).json({ message : "Error: " +err.errors[0].message});
  })
})
app.get("/api/product" , verifyToken,  (req,res) =>{
  if (!req.query.userId || !req.query.productId ){
    return res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" ) + (!req.query.productId ?  " req.query.productId not defined " : "" ) });
  }
  service.getOneProductsFromUser(req.query.userId, req.query.productId).then(function(data){
    return data == null ?  res.status(401).json({message : "User has no products "}) : res.status(200).json(data) ;
  }).catch(function(err){
    return res.status(500).json({ message :"Error: " + err.errors[0].message});
  })
})

app.post("/api/login", upload.none(),async (req, res)=>{
  console.log("WHAT?");
  if(!req.body.email|| !req.body.password ){
      return res.status(400).json({ message: "Error: "  + (!req.body.password ?  " req.body.password not defined " : "") +  (!req.body.email ?  " req.body.email not defined " : "") });
  }
  service.authenticateUser(req.body.email).then(function(data){
    if (data.password == req.body.password){
      console.log("")
      const token = jwt.sign({ userId: data.dataValues.id }, process.env.JWT_SECRET);
      return res.status(200).json({ token : token, userid : data.dataValues.id, fullname : data.dataValues.fullname, rank : data.dataValues.Rank, points :   data.dataValues.points});
    }
    else {
      return res.status(401).json({ message: "Unauthorized: Invalid email / password" });
    }
  }).catch(function(err){
    return res.status(500).json({ message : "Error: " +  err.errors[0].message});
  })

  
})


app.post("/api/register", upload.none(), async (req, res)=>{
    
  if(!req.body.email || !req.body.password || !req.body.fullname){
    return res.status(400).json({ message: "Error: "  + (!req.body.password ?  " req.body.password not defined " : "") +  (!req.body.email ?  " req.body.email not defined " : "") + (!req.body.fullname ?  " req.body.fullname not defined " : "")  });
  }
   service.registerUser(req.body.email, req.body.password, req.body.fullname).then(function(data){ 
    const token = jwt.sign({ userId: data.dataValues.id}, process.env.JWT_SECRET);
      return res.status(200).json({ token : token, userid : data.dataValues.id, fullname : data.dataValues.fullname, rank : data.dataValues.Rank, points :   data.dataValues.points});
 
  }).catch(function(err){
      return res.status(500).json({ ErrorMessage : "Error: " + err.errors[0].message});
  })
  
})

app.post("/api/product/edit" , verifyToken,upload.none(),(req,res) =>{
 console.log("Here")
  if (!req.query.userId  || !req.query.productId|| !req.body.food_name || !req.body.expiry_date){
     return res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" ) + (!req.query.productId ?  " req.query.productId not defined " : "" ) +  (!req.body.food_name ?  " req.body.food_name not defined " : "" ) + (!req.body.expiry_date ?  " req.body.expiry_date not defined " : "" ) });
  } 
  service.editProductFromUser(req.query.userId,req.query.productId, req.body.food_name, req.body.expiry_date).then(function(data){
    return data == null ?  res.status(401).json({message : "Product doesn't exist "}) : res.status(200).json(data) ;
  }).catch(function(err){
    return res.status(500).json({err});
  })
 
})

app.delete("/api/product/delete", verifyToken, upload.none(),(req,res) =>{
  if (!req.query.userId  || !req.query.productId ){
     return res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" ) + (!req.query.productId ?  " req.query.productId not defined " : "" )  });
  }
  service.deleteProductFromUser(req.query.userId,req.query.productId).then(function(data){
    return res.status(200).send()
  }).catch(function(err){
    return res.status(500).json({ message : "Error: " + err.errors[0].message});
  })

})

app.post("/api/product/create", verifyToken, upload.none(),(req,res) =>{

  if (!req.query.userId|| !req.body.food_name  || !req.body.expiry_date){
       return  res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" )  +  (!req.body.food_name ?  " req.body.food_name not defined " : "" ) + (!req.body.expiry_date  ?  " req.body.expiry_date not defined " : "") });
  }
  service.createProductFromUser(req.query.userId, req.body.food_name, req.body.expiry_date).then(function(data){
    return res.status(200).json(data);
  }).catch(function(err){
    return res.status(500).json({ message : "Error: " + err.errors[0].message});
  })
 
})


app.post("/api/gpt/upload/recipe/verification", verifyToken, (req, res) => {
  upload.single('picture')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Multer error: " + err.message });
    }
    if (!req.query.userId || !req.query.recipeId) {
        return res.status(400).json({ message: "Error: " + (!req.query.userId ? " req.query.userId not defined. " : "")  + + (!req.query.recipeId ? " req.query.recipeId not defined. " : "")});
    }
    service.getOneRecipeByUser(req.query.userId, req.query.recipeId).then(async function(recipe_data){
      
      const base64Image = req.file.buffer.toString("base64");
      console.log(recipe_data);
      payload.messages[0].content = [
        {
          type: 'text',
           text: `Here is a recipe name ${recipe_data.recipe_name}. The image I'm sending shows a plate of food. Does it match the recipe name ? If yes, return: { "verification": true, "reason": "..." }. If not, return: { "verification": false, "reason": "..." }. Only respond in valid JSON.`
        },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ]
      let requestCompleted = false, count = 0, data;
      while (requestCompleted == false && count < 3){
        console.log("Chattinggg....")
        await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers })
        .then((response) => {
          if (response.data.choices.length != 0){
            data = JSON.parse(response.data.choices[0].message.content.replace(/```json\s*/i, "").replace(/```/g, ""));
            requestCompleted = true;
          }
        })
        .catch((error) => {
          data = error
        });
        count++;
      }

      if(requestCompleted){
        if (data.verification == true){
            console.log("req.query.recipeId - " + req.query.recipeId)
            service.gainXp(req.query.userId, recipe_data.points,req.query.recipeId).then(function(user){
              service.getAllRecipesByUser(req.query.userId).then(function(reciepe_return){
                return res.status(200).json({ verification : data, user : user, recipes : reciepe_return})
              }).catch(function(error){
              res.status(500).json({message: "Error: " + error})
            })
              
            }).catch(function(error){
              res.status(500).json({message: "Error: " + error})
            })
        }else{
            res.status(500).json({data})
        }
          
  
      }else {
        return (requestCompleted ? res.status(200).json(data) :  res.status(500).json({message: "Error: " + data}) ) 
      }



    }).catch(function(err){
      return res.status(500).json({ message : "Error: " + err});
    })
    
  })
});

app.post("/api/gpt/upload/picture", verifyToken, (req, res) => {
  upload.single('picture')(req, res, async (err) => {

      if (err) {
          return res.status(400).json({ message: "Multer error: " + err.message });
      }
      if (!req.query.userId) {
          return res.status(400).json({ message: "Error: " + (!req.query.userId ? " req.query.userId not defined. " : "") });
      }
      const base64Image = req.file.buffer.toString("base64");
      const today = new Date();
      const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
      payload.messages[0].content = [
        {
          type: 'text',
          text: `get me each item of the receipt and translate into JSON and predict the expiry date based on the product from today. Todays date is ${formattedDate}. Only include what you recognize to be a food product and dont add any extra fields in the JSON. Always respond in valid JSON. Use this structure.  eg. [ { "food_name": "Tomatoes", "expiry_date": "2025/03/20" },]` 
        },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ]

      let requestCompleted = false, count = 0, data;
      while (requestCompleted == false && count < 3){
        console.log("Chattinggg....")
        await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers })
        .then((response) => {
          if (response.data.choices.length != 0){
            data = JSON.parse(response.data.choices[0].message.content.replace(/```json\s*/i, "").replace(/```/g, ""));
            requestCompleted = true;
          }
        })
        .catch((error) => {
          data = error
        });
        count++;
      }

      if(requestCompleted){
        service.createManyProducts(req.query.userId, data).then(function(data){
          return res.status(200).json(data)
        }).catch(function(err){
          return res.status(500).json({message: "Error: " + err})
        })
      }else {
        return (requestCompleted ? res.status(200).json(data) :  res.status(500).json({message: "Error: " + data}) ) 
      }

  });
});


app.get("/api/recipes/fromuser", verifyToken, (req,res)=>{
  service.getAllRecipesByUser(req.query.userId).then(function(data){
    return res.status(200).json(data)
  }).catch(err =>{
    res.status(500).json({message: "Error: " + err})
  })
}) 
app.get("/api/gpt/recipes", verifyToken, async (req, res) => {
    console.log("Here>")
    if (!req.query.userId) {
          return res.status(400).json({ message: "Error: " + (!req.query.userId ? " req.query.userId not defined. " : "") });
    }
    service.getAllProductBeforeExpiryDate(req.query.userId).then(async function(data){
      console.log("In here LOLDFDFO")
      payload.messages[0].content = [
        {
          type: 'text',
          text: `Generate me 3  healthy recipes based on the priotizing the ingredients that are expiring soon and only using the ingredients that are listed ${JSON.stringify(data)}, return each recipe in this format. Always respond in valid JSON. Use this structure. And out of 20 points assign how healthy the recipe is.  eg. "recipe_name": "Stir-Fried Garlic Vegetables",
"ingredients": [
      { "food_id": 5, "quantity": "1 bunch" },
      { "food_id": 6, "quantity": "1 head" },
      { "food_id": 7, "quantity": "3 stalks" },
      { "food_id": 9, "quantity": "2 cups" }
    ],

    "steps": [
      {
        "step_number": 1,
        "step_instruction": "Wash and chop asparagus, broccoli, green onions, and spinach."
      },
      {
        "step_number": 2,
        "step_instruction": "Heat oil in a pan. Sauté minced garlic until fragrant."
      },
      {
        "step_number": 3,
        "step_instruction": "Add broccoli and asparagus. Stir-fry for 4-5 minutes."
      },
      {
        "step_number": 4,
        "step_instruction": "Toss in spinach and green onions. Cook for 2 more minutes. Season with soy sauce and serve."
      }
    ],
    "points" : "15",
    "time" : "45min,
    "completed" : false
    }]`
        }
      ];
      

    let requestCompleted = false, count = 0, data_recipes;
    while (requestCompleted == false && count < 3){
      console.log("Chattinggg....")
      await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers })
      .then((response) => {
        if (response.data.choices.length != 0){
          data_recipes = JSON.parse(response.data.choices[0].message.content.replace(/```json\s*/i, "").replace(/```/g, ""));
          requestCompleted = true;
        }
      })
      .catch((error) => {
        console.log(error)
        data = error
      });
      count++;
      
    }
    if(requestCompleted){
      service.createMultipleRecipesForUser(req.query.userId,data_recipes).then(function(data){
        return res.status(200).json(data)
      }).catch(function(err){
        console.log(err);
        return res.status(400).json(err);
      })
      
    }else {
      return (requestCompleted ? res.status(200).json(data) :  res.status(500).json({message: "Error: " + data}) ) 
    }
    }).catch(function(err){
      return res.status(500).json({message: "Error: " + err})
    })
  
});





/*Test calls */
/*TEST API CALL - Get all product through associated through user id  URL - http://localhost:8080/api/test/products?userId=${userId}  */
app.get("/api/test/products" , (req,res) =>{
    if (!req.query.userId){
        return res.status(400).json({ message: "Error: req.query.userId not defined "});
    }
    return res.status(200).json(food);
})
/*TEST API CALL - Get single product through associated through user id and product id URL - http://localhost:8080/api/test/product?productId=${productId}&userId=${userId} */
app.get("/api/test/product" , (req,res) =>{
    if (!req.query.userId || !req.query.productId){
        return res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" ) + (!req.query.productId ?  " req.query.productId not defined " : "" ) });
    }
    let save = null;
    for (let i = 0; i < food.length; i++){
        if (req.query.productId == food[i].id){
            save = food[i];
            break;
        }
    }
    return (save != null ? res.status(200).json(save) : res.status(404).json({ message: "Error: Product not found"  }));

})

/*TEST API CALL - Edit single product through associated through user id and product id. Body parameter should include ("food_name": "Vanilla Yogurt", "expiry_date": "2025/03/17")  URL - http://localhost:8080/api/test/product/edit?productId=${productId}&userId=${userId} */
/*app.put("/api/test/product/edit" , verifyToken,upload.none(),(req,res) =>{
    if (!req.query.userId  || !req.query.productId|| !req.body.food_name || !req.body.expiry_date){
       return res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" ) + (!req.query.productId ?  " req.query.productId not defined " : "" ) +  (!req.body.food_name ?  " req.body.food_name not defined " : "" ) + (!req.body.expiry_date ?  " req.body.expiry_date not defined " : "" ) });
    }
    let tf = false;
    for (let i = 0; i < food.length; i++){
        if (req.query.productId == food[i].id){
            food[i].food_name = req.body.food_name;
            food[i].expiry_date = req.body.expiry_date;
            tf = true;
            break;

        }
    }
    return (tf ? res.status(200).json(food) : res.status(404).json({ message: "Error: Product not found"  })); 
}) */
/*TEST API CALL - Delete single product through associated through user id and product id.  URL - http://localhost:8080/api/test/product/delete?productId=${productId}&userId=${userId} */
app.delete("/api/test/product/delete" , upload.none(),(req,res) =>{
  if (!req.query.userId  || !req.query.productId ){
     return res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" ) + (!req.query.productId ?  " req.query.productId not defined " : "" )  });
  }
  
  let tf = false;
  for (let i = 0; i < food.length; i++){
      if (req.query.productId == food[i].id){
          console.log(food[i].id);
          food.splice(i,1);
          tf = true;
          break;

      }
  }
  return (tf ? res.status(200).json(food) : res.status(404).json({ message: "Error: Product not found"  })); 
})

/*TEST API CALL - Create single product through associated through user id. Body parameter should include ("food_name": "Vanilla Yogurt", "expiry_date": "2025/03/17")  URL - http://localhost:8080/api/test/product/create?userId=${userId} */
app.post("/api/test/product/create" , upload.none(), (req,res) =>{
    if (!req.query.userId|| !req.body.food_name  || !req.body.expiry_date){
       return  res.status(400).json({ message: "Error: " + (!req.query.userId ?  " req.query.userId not defined " : "" )  +  (!req.body.food_name ?  " req.body.food_name not defined " : "" ) + (!req.body.expiry_date  ?  " req.body.expiry_date not defined " : "") });
    }
    var last_id = food[food.length - 1].id + 1;
    food.push({"id" : last_id , "food_name": req.body.food_name , "expiry_date": req.body.expiry_date})
    return res.status(200).json(food);
})

/*TEST API CALL - Upload picture to deepseek and get response back with json data. Body paramter for image should be called "picture"  URL - http://localhost:8080/api/test/deepseek/upload/picture?userId=${userId}*/ 
app.post("/api/test/deepseek/upload/picture", (req, res) => {
    upload.single('picture')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: "Multer error: " + err.message });
        }
        if (!req.query.userId) {
            return res.status(400).json({ message: "Error: " + (!req.query.userId ? " req.query.userId not defined. " : "") });
        }
        return res.status(200).json(food);
    });
});

/*TEST API CALL - Login default credentials are Email : "example@gmail.com", Password : "1234"   Body parameter should include ("email": "example@gmail.com", "password": "1234") URL - http://localhost:8080/api/test/login*/ 
app.post("/api/test/login", upload.none(),(req, res)=>{
    
    if(!req.body.email|| !req.body.password ){
        return res.status(400).json({ message: "Error: "  + (!req.body.password ?  " req.body.password not defined " : "") +  (!req.body.email ?  " req.body.email not defined " : "") });
    }
    if(req.body.email == "example@gmail.com" && req.body.password == "1234"){
        let user = { "userId" : 1, "email" : "example@gmail.com"};
        return res.status(200).json(user);
    }
    return res.status(401).json({ message: "Unauthorized: Invalid email / password" });
})
/*TEST API CALL - Register route, Body parameter should include ("email": "example@gmail.com", fullname :"Micheal Smith", password": "1234) URL - http://localhost:8080/api/test/register*/ 
app.post("/api/test/register", upload.none(),(req, res)=>{
 
  if(!req.body.email || !req.body.password || !req.body.fullname){
      return res.status(400).json({ message: "Error: "  + (!req.body.password ?  " req.body.password not defined " : "") +  (!req.body.email ?  " req.body.email not defined " : "") + (!req.body.fullname ?  " req.body.fullname not defined " : "")  });
  }
  else {
     let user = { "userId" : 1, "email" : req.body.email };
     return res.status(200).json(user);
  }
})


/*TEST API CALL - Get Recipes - http://localhost:8080/api/test/recipes*/
app.get("/api/test/recipes", upload.none(),(req, res)=>{
  return res.status(200).json(recipes);
})

/*TEST API CALL - Reset API to original data - http://localhost:8080/api/test/reset*/ 
app.get("/api/test/reset", upload.none(),(req, res)=>{
    food = [...reset];
    return res.status(200).json(food);
})

/* DATA */
var food = [
    {
          "id" : 1,
          "food_name": "Vanilla Yogurt",
          "expiry_date": "2025/03/17"
        },
        {
          "id" : 2,
          "food_name": "Black Cherry Greek Yogurt",
          "expiry_date": "2025/03/16"
        },
        {
          "id" : 3,
          "food_name": "Avocado",
          "expiry_date": "2025/03/12"
        },
        {
          "id" : 4,
          "food_name": "Russet Potatoes",
          "expiry_date": "2025/04/01"
        },
        {
          "id" : 5,
          "food_name": "Asparagus",
          "expiry_date": "2025/03/21"
        },
        {
          "id" : 6,
          "food_name": "Broccoli",
          "expiry_date": "2025/03/23"
        },
        {
          "id" : 7,
          "food_name": "Green Onion",
          "expiry_date": "2025/03/25"
        },
        {
          "id" : 8,
          "food_name": "Roma Tomato",
          "expiry_date": "2025/03/23"
        },
        {
          "id" : 9,
          "food_name": "Spinach",
          "expiry_date": "2025/03/21"
        },
        {
          "id" : 10,
          "food_name": "English Cucumber",
          "expiry_date": "2025/03/25"
        },
]

var recipes = [
  {
    "recipe_name": "Stir-Fried Garlic Vegetables",
    "ingredients": [
      { "food_id": 5, "quantity": "1 bunch" },
      { "food_id": 6, "quantity": "1 head" },
      { "food_id": 7, "quantity": "3 stalks" },
      { "food_id": 9, "quantity": "2 cups" }
    ],
    "steps": [
      {
        "step_number": 1,
        "step_instruction": "Wash and chop asparagus, broccoli, green onions, and spinach."
      },
      {
        "step_number": 2,
        "step_instruction": "Heat oil in a pan. Sauté minced garlic until fragrant."
      },
      {
        "step_number": 3,
        "step_instruction": "Add broccoli and asparagus. Stir-fry for 4-5 minutes."
      },
      {
        "step_number": 4,
        "step_instruction": "Toss in spinach and green onions. Cook for 2 more minutes. Season with soy sauce and serve."
      }
    ]
  },
  {
    "recipe_name": "Fresh Garden Salad",
    "ingredients": [
      { "food_id": 8, "quantity": "2 medium" },
      { "food_id": 10, "quantity": "1 large" },
      { "food_id": 9, "quantity": "1.5 cups" },
      { "food_id": 7, "quantity": "2 stalks" }
    ],
    "steps": [
      {
        "step_number": 1,
        "step_instruction": "Slice Roma tomatoes, English cucumber, and green onions."
      },
      {
        "step_number": 2,
        "step_instruction": "In a bowl, combine spinach, tomatoes, cucumber, and green onions."
      },
      {
        "step_number": 3,
        "step_instruction": "Drizzle with olive oil, lemon juice, salt, and pepper. Toss gently."
      }
    ]
  },
  {
    "recipe_name": "Roasted Veggie Medley",
    "ingredients": [
      { "food_id": 5, "quantity": "1 bunch" },
      { "food_id": 6, "quantity": "1 head" },
      { "food_id": 8, "quantity": "3 medium" }
    ],
    "steps": [
      {
        "step_number": 1,
        "step_instruction": "Preheat oven to 400°F (200°C)."
      },
      {
        "step_number": 2,
        "step_instruction": "Chop asparagus, broccoli, and Roma tomatoes into bite-sized pieces."
      },
      {
        "step_number": 3,
        "step_instruction": "Toss veggies with olive oil, salt, and pepper. Spread on a baking sheet."
      },
      {
        "step_number": 4,
        "step_instruction": "Roast for 20-25 minutes until tender and slightly charred. Serve warm."
      }
    ]
  }
]


var reset = [...food];