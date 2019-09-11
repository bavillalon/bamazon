var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'bamazon'
});

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

function addToInventory(){
    connection.query("SELECT * FROM products",function(err,response){
        if(err) throw err;
        var productArray=[];
        console.log("*********************************************");
        console.log("View products below...");
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

