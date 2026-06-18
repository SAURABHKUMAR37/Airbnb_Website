const {getDb}=require("../utill/databaseutill");
const bcrypt=require("bcryptjs");
 module.exports=class User{
    constructor(name,email,password)
    {
        this.name=name;
        this.email=email;
        this.password=password;
    }
    async save()
    {
        const db=getDb();
        const hashedPassword=await bcrypt.hash(this.password,12);
        this.password=hashedPassword;
        return db.collection("users").insertOne(this);
    }
    static findByEmail(email,callback){
        const db=getDb();
        db.collection("users")
        .findOne({email:email})
        .then(user=>callback(user))
        .catch(err=>console.log(err));
    }
 };
 