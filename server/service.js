const Sequelize = require('sequelize');
var fs = require('fs');
const { type } = require('os');
const { Op } = require('sequelize');
const { error } = require('console');
if(process.env.NODE_ENV !== 'production'){
    require("dotenv").config();
}

var sequelize = new Sequelize(
    process.env.DB_NAME,   // database name
    process.env.DB_USER,    // username
    process.env.DB_PASS,  // password
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    }
);

sequelize.authenticate().then(function(){

    console.log("Connection succesful to postgre");
    
    }).catch(function(err){
    console.log("Error connection to postgre : " + err);
   
});




var user = sequelize.define('Users',{
    email : {
        unique: true,
        type : Sequelize.STRING
    },
    fullname : Sequelize.STRING,
    password : Sequelize.STRING,
    token :  Sequelize.STRING,
    points : Sequelize.INTEGER
    
});

var product = sequelize.define('Products',{
    food_name : Sequelize.STRING,
    expiry_date : {
        type: Sequelize.DATE, // Use DATE for a date attribute
        //allowNull: false, // Set to true if the field is optional
    }
});

var rank = sequelize.define('Rank',{
    rank_name : Sequelize.STRING,
    max_points : Sequelize.INTEGER,
    rank_badge : Sequelize.STRING,
    
});
rank.hasMany(user, { foreignKey: 'rank_id' });

// One User belongs to one Rank
user.belongsTo(rank, { foreignKey: 'rank_id', allowNull: false });

const Recipe = sequelize.define('Recipes', {
    recipe_name: Sequelize.STRING,
    points: Sequelize.INTEGER,
    time: Sequelize.STRING,
    completed : Sequelize.BOOLEAN
  });
  
  // Link Recipe to User
  user.hasMany(Recipe, { foreignKey: 'user_id' });
  Recipe.belongsTo(user, { foreignKey: 'user_id' });

  const RecipeStep = sequelize.define('RecipeSteps', {
    step_number: Sequelize.INTEGER,
    step_instruction: Sequelize.TEXT
  });
  
  const RecipeIngredient = sequelize.define('RecipeIngredients', {
    quantity: Sequelize.STRING
  });
  
  // Link product (food item) to recipe through RecipeIngredients
  Recipe.belongsToMany(product, {
    through: RecipeIngredient,
    foreignKey: 'recipe_id'
  });
  product.belongsToMany(Recipe, {
    through: RecipeIngredient,
    foreignKey: 'product_id'
  });

  Recipe.hasMany(RecipeStep, { foreignKey: 'recipe_id' });
  RecipeStep.belongsTo(Recipe, { foreignKey: 'recipe_id' });

user.hasMany(product, { foreignKey: 'user_id' });
product.belongsTo(user, { foreignKey: 'user_id' });



sequelize.sync(/*{force : true}*/).then(async function(){
   /*
    let userid = null;
    const created = await rank.bulkCreate([
        {
          rank_name: "Starter",
          max_points: 100,
          rank_badge: "🥚"
        },
        {
          rank_name: "Learner",
          max_points: 200,
          rank_badge: "🌱"
        },
        {
          rank_name: "Focused Eater",
          max_points: 300,
          rank_badge: "🔥"
        },
        {
          rank_name: "Champion",
          max_points: 400,
          rank_badge: "🥇"
        },
        {
          rank_name: "Food Guardian",
          max_points: 500,
          rank_badge: "👑"
        }
      ])
   await user.create({
        fullname :  "Igor Gancharenka",
        email : "igorganch1@gmail.com",
        password : "1234",
        rank_id : created[0].id,
        points : 0

    }).then(function(data){
        product.create({
            food_name :"Apples",
            expiry_date : new Date('2022-01-01'),
            user_id : data.id
    
        })
        const entries = [
            {"food_name":"Mahatma Jasmine Rice","expiry_date":"2026-03-20T04:00:00.000Z","user_id":1,},
            {"food_name":"BLS Chicken Breast MD","expiry_date":"2025-03-27T04:00:00.000Z","user_id":1},
            {"food_name":"NY Strip Thin","expiry_date":"2025-03-23T04:00:00.000Z","user_id":1},
            {"food_name":"Onions","expiry_date":"2025-04-03T04:00:00.000Z","user_id":1},
            {"food_name":"Potatoes","expiry_date":"2025-04-17T04:00:00.000Z","user_id":1},
            {"food_name":"Garlic","expiry_date":"2025-04-17T04:00:00.000Z","user_id":1},
       
          ];
          product.bulkCreate(entries);
    })

    */
    
});    

module.exports.getAllProductsFromUser = function(id){
    return new Promise(function(resolve,reject){
        product.findAll({where :{
            user_id : id
        },order: [['expiry_date', 'ASC']]}).then(function(res){
            
            resolve(res);
        }).catch(function(err){
            reject(err)
        })

    })

}


module.exports.getUser = function(userId) {
    return new Promise(function(resolve, reject) {
      user.findOne({
        where: { id: userId },
        include: [
          {
            model: rank,
            attributes: ['rank_name', 'rank_badge', 'max_points']
          },
          {
            model: Recipe,
            attributes: ['id', 'recipe_name', 'points', 'time']
          }
        ]
      })
      .then(function(res) {
        resolve(res);
      })
      .catch(function(err) {
        reject(err);
      });
    });
  };


module.exports.authenticateUser = function(email,password){
    console.log("wtf4324324324234234234 ");
    return new Promise(function(resolve,reject){
        user.findOne({
            where: {
              email: email,
            },
            include: [
              {
                model: rank,
                attributes: ['rank_name', 'rank_badge', 'max_points'],
              }
            ]
          }).then(function(res){
          
            console.log("wtf4324324324234234234 ");
            resolve(res);
        }).catch(function(err){
            reject(err)
        })

    })

}



module.exports.registerUser = function(email, password, fullname) {
    return new Promise(function(resolve, reject) {
      user.create({
        fullname: fullname,
        email: email,
        password: password,
        points: 0,
        rank_id: 1,
      })
      .then(function(createdUser) {
        // Fetch the user again to include the rank
        return user.findOne({
          where: { id: createdUser.id },
          include: [
            {
              model: rank,
              attributes: ['rank_name', 'rank_badge', 'max_points'],
            }
          ]
        });
      })
      .then(function(userWithRank) {
        console.log(userWithRank);
        resolve(userWithRank);
      })
      .catch(function(err) {
        console.log(err);
        reject(err);
      });
    });
  };
  

module.exports.getOneProductsFromUser = function(user_id, product_id, token){
    return new Promise(function(resolve,reject){
        product.findOne({where :{
            user_id : user_id,
            id : product_id
        }}).then(function(res){
            resolve(res);
        }).catch(function(err){
            reject(err)
        })

    })

}

module.exports.editProductFromUser = function(user_id, product_id, food_name,expiry_date){
    return new Promise(function(resolve,reject){
        product.update({
            food_name : food_name,
            expiry_date : expiry_date
        },{where :{
            user_id : user_id,
            id : product_id
        }}).then(function(res){
            console.log("In here?")
            module.exports.getOneProductsFromUser(user_id,product_id).then(function(data){
                resolve(data);
            }).catch(function(err){
                reject(err)
            })
        }).catch(function(err){
            reject(err)
        })

    })

}


module.exports.deleteProductFromUser = function(user_id, product_id){
    return new Promise(function(resolve,reject){
        product.destroy({where :{
            user_id : user_id,
            id : product_id
        }}).then(function(){
          console.log("Whats wrong?")
            resolve()
        }).catch(function(err){
            console.log("something  wrong?")
            reject(err)
        })
    })

}

module.exports.createProductFromUser = function(user_id,food_name,expiry_date  ){
    return new Promise(function(resolve,reject){
        product.create({
            food_name :food_name,
            expiry_date : expiry_date,
            user_id : user_id
        }).then(function(data){
           resolve(data)
        }).catch(function(err){
            reject(err)
        })
    })

}

module.exports.createManyProducts = function(user_id,productsArray) {
    const creationPromises = productsArray.map(item => {
        return product.create({
          food_name: item.food_name,
          expiry_date: item.expiry_date,
          user_id: user_id
        });
      });

      return Promise.all(creationPromises).then(function(data) {
          return data;
        })
        .catch(function(err){
          throw err;
    });
  };

  module.exports.getAllProductBeforeExpiryDate = function(user_id) {  
    return new Promise(function(resolve, reject) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
  
      product.findAll({
        where: {
          user_id: user_id,
          expiry_date: {
            [Op.gte]: today // expiry_date is >= today
          }
        },
        order: [['expiry_date', 'ASC']] // ✅ Correct place
      }).then(function(res) {
        resolve(res);
      }).catch(function(err) {
        reject(err);
      });
    });
  };


  module.exports.createMultipleRecipesForUser = async function(userId, recipesArray) {
    try {
      const createdRecipes = [];
  
      for (const recipeData of recipesArray) {
        const { recipe_name, time, steps, ingredients,completed } = recipeData;
  
        // Make sure points is stored as number
        const points = parseInt(recipeData.points);
  
        // 1. Create recipe
        const recipe = await Recipe.create({
          recipe_name,
          points,
          time,
          user_id: userId,
          completed
        });
  
        // 2. Create steps
        if (Array.isArray(steps)) {
          const formattedSteps = steps.map(step => ({
            recipe_id: recipe.id,
            step_number: step.step_number,
            step_instruction: step.step_instruction
          }));
  
          await RecipeStep.bulkCreate(formattedSteps);
        }
  
        // 3. Create ingredients
        if (Array.isArray(ingredients)) {
          const formattedIngredients = ingredients.map(ingredient => ({
            recipe_id: recipe.id,
            product_id: ingredient.food_id, // 👈 mapped correctly
            quantity: ingredient.quantity
          }));
  
          await RecipeIngredient.bulkCreate(formattedIngredients);
        }
  
        createdRecipes.push(recipe);
      }
  
      return createdRecipes;
    } catch (err) {
      console.error("❌ Error creating multiple recipes:", err);
      throw err;
    }
  };

  module.exports.getAllRecipesByUser = async function(userId) {
    try {
      // Fetch all recipes for the user including steps and ingredients
      const recipes = await Recipe.findAll({
        where: { user_id: userId },
        include: [
          {
            model: RecipeStep,
            attributes: ['step_number', 'step_instruction']
          },
          {
            model: product,
            through: {
              attributes: ['quantity']
            },
            attributes: ['id'], // this will give us product_id aka food_id
          }
        ],
        order: [
          ['id', 'ASC'],
          [RecipeStep, 'step_number', 'ASC']
        ]
      });
  
      // Format the result
      const formatted = recipes.map(recipe => ({
        id : recipe.id,
        recipe_name: recipe.recipe_name,
        points: recipe.points,
        time: recipe.time,
        completed : recipe.completed,
        ingredients: recipe.Products.map(p => ({
          food_id: p.id,
          quantity: p.RecipeIngredients.quantity
        })),
        steps: recipe.RecipeSteps.map(step => ({
          step_number: step.step_number,
          step_instruction: step.step_instruction
        }))
      }));
  
      return formatted;
  
    } catch (err) {
      console.error("❌ Error fetching recipes:", err);
      throw err;
    }
  };
  module.exports.getOneRecipeByUser = async function(userId, recipeId) {
    try {
      if (!userId || !recipeId) {
        throw new Error("Missing userId or recipeId");
      }
  
      const recipe = await Recipe.findOne({
        where: {
          id: recipeId,
          user_id: userId
        },
        include: [
          {
            model: RecipeStep,
            attributes: ['step_number', 'step_instruction']
          },
          {
            model: product,
            through: {
              attributes: ['quantity']
            },
            attributes: ['id'] // gives food_id
          }
        ],
        order: [[RecipeStep, 'step_number', 'ASC']]
      });
  
      if (!recipe) return null;
  
      return {
        id: recipe.id,
        recipe_name: recipe.recipe_name,
        points: recipe.points,
        time: recipe.time,
        completed : recipe.completed,
        ingredients: recipe.Products.map(p => ({
          food_id: p.id,
          quantity: p.RecipeIngredients.quantity
        })),
        steps: recipe.RecipeSteps.map(step => ({
          step_number: step.step_number,
          step_instruction: step.step_instruction
        }))
      };
    } catch (err) {
      console.error("❌ Error fetching recipe by ID:", err);
      throw err;
    }
  };

  module.exports.gainXp = async function(userId, points, recipe_id) {
    
    return new Promise(function(resolve, reject) {
        
        Recipe.update({ completed : true} ,{
            where : {
                id : recipe_id
            }
        }).then(function(){
            
        module.exports.getUser(userId).then(function(data){
            console.log( "(data.points + points) " +(data.points + points)  )
            console.log( "data.dataValues.Rank.dataValues.max_points- " +data.dataValues.Rank.dataValues.max_points )
            if ((data.points + points) > data.dataValues.Rank.dataValues.max_points){
             
                rank.findOne({
                    where: {
                      max_points: {
                        [Sequelize.Op.gt]: (data.dataValues.Rank.dataValues.max_points + points)
                      }
                    },
                    order: [['max_points', 'ASC']]
                  }).then(function(rank){
                       console.log("here rank up")
                        console.log(rank)
                        user.update({
                            points : data.points + points,
                            rank_id : rank.id
                        },{where :{
                            id : userId
                        }}).then(function(){

                            
                            data.points = data.points + points;
                            resolve(data);
                        })
                  }).catch(function(err){
                        reject(err);
                  })
            }
            else {
                user.update({
                    points : data.points + points
                },{where :{
                    id : userId
                }}).then(function(){

                    data.points = data.points + points;
                    console.log("DONE")
                    resolve(data)
                }).catch(function(err){
                    reject(err);
              })
          
            }

        
   
       
           
            
        })
        }).catch(error => reject(error))


    })


}

 
  
