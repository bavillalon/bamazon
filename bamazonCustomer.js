var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});

function startBamazon() {
    var productsArray = [{ name: "Exit Bamazon", value: 0 }];
    connection.query('SELECT products.product_name, products.price, products.item_id FROM products', function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            productsArray.push({
                name: `${res[i].item_id.toString()}: "${res[i].product_name}" Priced at $${res[i].price}`,
                value: res[i].item_id
            });
        };
        console.log("*********************************************");
        console.log("Welcome to Bamazon!");
        console.log("*********************************************");
        console.log("");
        inquirer.prompt([
            {
                type: 'list',
                name: 'item_id',
                message: 'Please select a product from the list below...',
                choices: productsArray
            },
            {
                type: 'number',
                name: 'quantity',
                message: 'How many would you like to purchase? (type 0 if you want to go back to the store)'
            }
        ]).then(function (response) {
            if (response.item_id > 0) {
                if (!isNaN(response.quantity)) {
                    if (response.quantity > 0) {
                        buySomething(response);
                    }
                    else {
                        startBamazon();
                    }
                }
                else {
                    console.log("Please enter a number");
                    startBamazon();
                }
            }
            else {
                connection.end();
            }
        });
        //console.log(res);
    });
};

function buySomething(productObject) {
    var customerQuantity = productObject.quantity;
    connection.query('SELECT products.stock_quantity, products.price, products.product_name FROM products WHERE ?', { item_id: productObject.item_id }, function (err, res) {
        if (err) throw err;
        var cost = 0;
        console.log("*********************************************");
        console.log(`You want to purchase ${customerQuantity} units of ${res[0].product_name} at ${res[0].price} per unit.`);
        if (customerQuantity <= res[0].stock_quantity) {
            cost = Math.floor(res[0].price * customerQuantity*100)/100;
            connection.query('UPDATE products SET ? WHERE ?', [
                { stock_quantity: res[0].stock_quantity - customerQuantity },
                { item_id: productObject.item_id }
            ], function (err) {
                if (err) throw err;
                console.log("You're in luck! We have enough.")
                console.log(`Order Placed! Your cost was ${cost}`);
                console.log("*********************************************");
                connection.end();
            });
        }
        else {
            console.log(`The quantity you requested is too high. There are only ${res[0].stock_quantity} in stock.`)
            inquirer.prompt([
                {
                    type: 'number',
                    name: 'update',
                    message: 'How many would you like to purchase? (type 0 if you want to go back to the store)'
                }
            ]).then(function (response) {
                if(response.update>0){
                    productObject.quantity = response.update;
                    buySomething(productObject);
                }
                else{
                    startBamazon();
                };
            });
        };
    });
};

//   connection.query('SELECT products.product_name, products.item_id FROM products', function(err,res){
//       if(err) throw err;
//       console.log(res);
//       connection.end();
//   });



connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
    startBamazon();
    // connection.end();
});

