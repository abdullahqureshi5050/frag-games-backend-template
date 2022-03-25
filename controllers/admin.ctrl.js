const fs = require("fs");
const express = require("express");
const state = require("../states");

const loginGet = (req, res) => {
  res.send(`
            <form method='POST' action='/login'>
                <div>
                <input placeholder='username'  id='username' name='username' />
                <input placeholder='password' type='password' name='password' />
                <button type='submit'> Login </button>
                </div>
            </form>
    `);
};

const adminDashboardGet = (req, res) => {
    res.send("Admin Dashboard");
  }

const addProductGet = (req, res) => {
  res.send(`
      <form method='POST' action='/admin/addproduct'>
          <div>
              <input placeholder='product ID' id='id' name='id' />
              <input placeholder='product name' id='name' name='name' />
              <input placeholder='quatity' id='quantity' name='quantity' />
              <input placeholder='product price' id='price' name='price' />
              <button type='submit'> Add Product </button>
          </div>
      </form>
      `);
};

const addProductPost = (req, res) => {
  let productsList = [];
  try {
    const { id, name, quantity, price } = req.body;
    productsList.push({ name, quantity, price });
    console.log(productsList);

    fs.appendFile(
      "productsList.json",
      ` Product name = ${name}, Stock = ${quantity}, price = PKR ${price}`,
      (err) => {
        err
          ? console.log(`somthing went wrong: ${err.message}`)
          : res.json({ success: true });
      }
    );

    const newProduct = { id, name, quantity, price };
    let obj = {
      products: [],
    };

    obj.products.push(newProduct);
    var json = JSON.stringify(obj);

    fs.exists("./productsList.json", async (exists) => {
      if (exists) {
        await fs.readFile(
          "productsList.json",
          "utf8",
          function readFileCallback(err, data) {
            if (err) {
              console.log(err);
            } else {
              obj = JSON.parse(data);
              obj.products.push(newProduct);
              json = JSON.stringify(obj);
              fs.writeFile("productsList.json", json, "utf8", (err) => {
                if (err) {
                  console.log("error");
                } else {
                  console.log("success");
                }
              });
            }
          }
        );
      } else {
        fs.writeFile("productsList.json", json, "utf8", (err) => {
          if (err) {
            console.log("error");
          } else {
            console.log("success");
          }
        });
      }
    });
  } catch (error) {
    console.log(`err = ${error}`);
  }
};

const updatePassword = (req, res)=>{
  {
    const { oldPassword, newPassword, username} = req.body;
    let productsFile = fs.readFileSync("usersv2.json");
    const users = JSON.parse(productsFile);
    const usersArr = users.users;
    
    usersArr.filter((cb) => {
        
        if (cb.password == oldPassword && cb.username == username){
          console.log(`${cb.password}`);
          const password = newPassword;
          fs.writeFileSync('usersv2.json', JSON.stringify({username, password}));
          return res.status(204).json({sucess: true});
          }
        }
       
    );
  };
}

module.exports = dashboard = {
    adminDashboardGet,
    addProductGet,
    addProductPost,
    loginGet,
    updatePassword,
}