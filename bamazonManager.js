//requires for sql and inquirer
var mysql = require('mysql');
var inquirer = require('inquirer');

//using the mysql create connection constructor, we are creating the required connection to the bamazon host.
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});

//start bamazon manager allows the manager to select modes to manage the database. the first variable is an array to select from the inquirer prompt
function startBamazonManager() {
    var managerModes = [
        { name: "Exit Manager Mode", value: 0 },
        { name: "View Products for Sale", value: 1 },
        { name: "View Low Inventory", value: 2 },
        { name: "Add to Inventory", value: 3 },
        { name: "Add Product", value: 4 }
    ];
    console.log("");
    console.log("*********************************************");
    //prompot to select the manager mode. the switch statement allows for the execution of the various functions that control the sql database.
    inquirer.prompt([{
        type: 'list',
        name: 'managerAction',
        message: 'Select an action...',
        choices: managerModes
    }]).then(function (answer) {
        switch (answer.managerAction) {
            case 0:
                connection.end();
                break;
            case 1:
                viewProducts();
                break;
            case 2:
                viewLowInventory();
                break;
            case 3:
                addToInventory();
                break;
            case 4:
                addProduct();
                break;
        }
    })
};

//this queries the sql database and displays all of the products in bamazon along with their price, department, and stock quantity
function viewProducts(){
    connection.query("SELECT * FROM products",function(err,response){
        if(err) throw err;
        console.log("*********************************************");
        console.log("View products below...");
        for (let i=0; i<response.length;i++){
            console.log("");
            console.log(`Item ID: ${response[i].item_id}    ||Product Name: ${response[i].product_name} ||Department: ${response[i].department} ||Price ${response[i].price}    ||Stock Quantity: ${response[i].stock_quantity}`);
        }
        startBamazonManager();
    })
};

//displays the products that are low on inventory.
function viewLowInventory(){
    connection.query("SELECT * FROM bamazon.products WHERE stock_quantity<5",function(err,response){
        if(err) throw err;
        console.log("*********************************************");
        console.log("Low inventory products are below...");
        for (let i=0; i<response.length;i++){
            console.log("");
            console.log(`Item ID: ${response[i].item_id}    ||Product Name: ${response[i].product_name} ||Department: ${response[i].department} ||Price ${response[i].price}    ||Stock Quantity: ${response[i].stock_quantity}`);
        }
        startBamazonManager();
    })
};

//adds inventory for a particular product. 
function addToInventory(){
    connection.query("SELECT * FROM products",function(err,response){
        if(err) throw err;
        var productArray=[];
        console.log("*********************************************");
        console.log("View products below...");
        //this creates an array to select from for the inquirer prompt. the value that will be passed will be the item id.
        for (let i=0; i<response.length;i++){
            productArray.push({
                name: `Item ID: ${response[i].item_id}    ||Product Name: ${response[i].product_name} ||Department: ${response[i].department} ||Price ${response[i].price}    ||Stock Quantity: ${response[i].stock_quantity}`,
                value: response[i].item_id
            });
        };
        inquirer.prompt([
            {
                type:'list',
                name:'item_id',
                message:'Which item do you want to add inventory for?',
                choices: productArray
            },
            {
                type:'number',
                name:'quantity',
                message:'How much would you like to add?'
            }
        ]).then(function(answer){
            //after the user has answered how much htey want to add, the value is verified. if NaN, then we go back and start again. if valid, we add to the quantity in the database.
            if(!isNaN(answer.quantity)){
                var quantityToAdd=answer.quantity;
                connection.query('SELECT products.stock_quantity FROM products WHERE ?',{item_id:answer.item_id},function(err,res){
                    if(err) throw err;
                    let quantity=res[0].stock_quantity+quantityToAdd;
                    connection.query('UPDATE products SET ? WHERE ?',[
                    {stock_quantity:quantity},
                    {item_id:answer.item_id}
                    ],function(err){
                        if(err) throw err;
                        console.log('Inventory updated!');
                        startBamazonManager();
                    });
                });
            }
            else{
                console.log('Enter a number...')
                addToInventory();
            }
        });
    })
};

//adds products to the sql database. if the price is not a number we make the user reenter it. since stock can be updated, we allow for that to be 0
function addProduct(){
    inquirer.prompt([
        {
            type:'input',
            name:'product_name',
            message:'What is the name of the new product?'
        },
        {
            type:'input',
            name:'department',
            message:'What department does it belong in?'
        },
        {
            type:'number',
            name:'price',
            message:'What is the price of the new item?'
        },
        {
            type:'number',
            name:'stock_quantity',
            message:'What is the initial stock quantity? (invalid values will be set to 0)'
        }
    ]).then(function(answer){
        if(isNaN(answer.price)){
            console.log("Enter a number for the price");
            addProduct();
        }
        else{
            connection.query('INSERT INTO products SET ?',
            {
                product_name:answer.product_name,
                department:answer.department,
                price:answer.price,
                stock_quantity:answer.stock_quantity||0
            },function(err){
                if(err) throw err;
                console.log("Item added");
                startBamazonManager();
            })
        }
    })

};


//create the connection and start bamazon manager
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log("");
    console.log("*********************************************");
    console.log("Welcome to Bamazon Manager Mode!");
    console.log("*********************************************");
    console.log("");
    console.log('connected as id ' + connection.threadId);
    startBamazonManager();
    // connection.end();
});

