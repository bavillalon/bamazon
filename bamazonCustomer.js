var mysql=require('mysql');
var inquirer=require('inquirer');

var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'bamazon'
});

function startBamazon(){
    var productsArray=[];
    connection.query('SELECT products.product_name, products.item_id FROM products', function(err,res){
        if(err) throw err;
        for(let i=0; i<res.length;i++){
            productsArray[i]={name:res[i].product_name, value:res[i].item_id};
        };
        inquirer.prompt([
            {
                type:'list',
                name:'item_id',
                message:'Please select a product from the list below...',
                choices: productsArray
            }
        ]).then(function(response){
            console.log(response);
            connection.end();
        });
        //console.log(res);
    });

 //   connection.query('SELECT products.product_name, products.item_id FROM products', function(err,res){
 //       if(err) throw err;
 //       console.log(res);
 //       connection.end();
 //   });

};

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
    startBamazon();
   // connection.end();
  });

