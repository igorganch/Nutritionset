const Sequelize = require('sequelize');
var fs = require('fs');
const { type } = require('os');
const { Op } = require('sequelize');
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
    token :  Sequelize.STRING
    
});

var product = sequelize.define('Products',{
    food_name : Sequelize.STRING,
    expiry_date : {
        type: Sequelize.DATE, // Use DATE for a date attribute
        //allowNull: false, // Set to true if the field is optional
    }
});

user.hasMany(product, { foreignKey: 'user_id' });
product.belongsTo(user, { foreignKey: 'user_id' });



sequelize.sync(/*{force : true}*/).then(function(){
   /*
    let userid = null;
    user.create({
        fullname :  "Igor Gancharenka",
        email : "igorganch1@gmail.com",
        password : "1234"

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


module.exports.authenticateUser = function(email,password){
    return new Promise(function(resolve,reject){
        user.findOne({where :{
            email : email,
        }}).then(function(res){
            resolve(res);
        }).catch(function(err){
            reject(err)
        })

    })

}

module.exports.authenticateUser = function(email,password){
    return new Promise(function(resolve,reject){
        user.findOne({where :{
            email : email,
        }}).then(function(res){
            resolve(res);
        }).catch(function(err){
            reject(err)
        })

    })

}

module.exports.registerUser = function(email,password, fullname){
    return new Promise(function(resolve,reject){
        user.create({
            fullname :  fullname,
            email : email,
            password : password
    
        }).then(function(res){
            console.log(res);
            resolve(res);
        }).catch(function(err){
            console.log(err);
            reject(err)
        })

    })

}

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
        return new Promise(function(resolve, reject){
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            product.findAll({where :{
                user_id : user_id,
                expiry_date: {
                    [Op.gte]: today // expiry_date is greater than or equal to today
                },
                order: [['expiry_date', 'ASC']]
            }}).then(function(res){
                resolve(res);
            }).catch(function(err){
                reject(err)
            })
    
        })
   
    
  };




