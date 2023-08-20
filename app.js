const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const ejs = require('ejs');
const PORT = process.env.PORT || 3000;


app.set("view engine","ejs")

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const mongoose = require('mongoose');
mongoose.set('strictQuery',false);
// const User = require("./user");
mongoose.connect('mongodb+srv://Shivam_Gupta_:Ehc3pNGucnUgIxgP@cluster0.9c7rjya.mongodb.net/?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    //we are connected
    console.log("we are connected...")
});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to my to do list"

});

const item2 =new Item({
  name: "Hit the + button to add a item"
});

const item3 = new Item({
  name: "Hit the - button to remove last item"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items: [itemsSchema]
}
const List = mongoose.model("List",listSchema);


// Item.insertMany(defaultItems)
//   .then(() => {
//     console.log('User saved to the database');
//   })
//   .catch((error) => {
//     console.error('Error saving user:', error);
//   });
var options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
var today = new Date()
var day = today.toLocaleTimeString('en-us', options);

app.get('/', function (req, res) {
  // var options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
  // var prnDt = new Date().toLocaleTimeString('en-us', options);

  // res.send(prnDt);
  // var options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
  // var today = new Date()
  // var day = today.toLocaleTimeString('en-us', options);

  Item.find({})
    .then((foundItems) => {
      res.render("list",{kindOfDay : day , newListItems : foundItems});
    })
  
  // res.send('Hello World')
})

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;

  // List.find({})
  //   .then((FoundList)=>{
  //     res.render("list",{kindOfDay : customListName , newListItems : FoundList});
      
  //   })

  // List.findOne({name: customListName},function(err,foundList){
  //   if(!err){
  //     if(!foundList){
  //       const list = new List({
  //         name: customListName,
  //           items: item
  //       })
      
  //       list.save();

  //     }
  //   }
  //   else{
  //     res.render("list",{kindOfDay : foundList.name , newListItems : foundList.items});

  //   }

  // })

  List.findOne({ name: customListName })
  .then((foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: item1
      });

      list.save();
      // console.log('List created:', list);
    } else {
      res.render("list",{kindOfDay : foundList.name , newListItems : foundList.items});
    }
  })
  .catch((error) => {
    console.error('Error finding list:', error);
  });

})

app.post("/",function(req,res){
  const itemName = req.body.newItem
  const listName = req.body.button
  const item = new Item({
    name: itemName
  })

  if(listName === day){
    item.save();
    res.redirect("/");

  }
  else{
    List.findOne({name:listName})
      .then((foundList)=>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName)
      })

  }
})

app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const ListName = req.body.listName;

  if(ListName === day){
    Item.findByIdAndDelete(checkItemId)
    .then(()=>{
      console.log("delete item successfully");
    })
    .catch((error)=>{
      console.error('Error saving user:', error);
    })
    res.redirect("/");

  }
  else{
    List.findOneAndUpdate({name: ListName},{$pull :{items:{_id: checkItemId}}})
      .then(()=>{
        res.redirect("/"+ ListName)
      })
  }
  
  
})

app.listen(PORT,function(){
    console.log("server running at local host 3000");
});

