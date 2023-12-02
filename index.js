const app=require("./app");
const {PORT}=process.env;
app.listen(4000,(req,res)=>{
    console.log(`Server is listening at port ${PORT}`)
})