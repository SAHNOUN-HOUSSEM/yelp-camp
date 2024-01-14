const mongoose= require("mongoose")

const {Schema}= mongoose

const addressSchema = new Schema({
    country: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    town: {
        type: String,
        required: true,
        trim: true
    },
    zipcode:{
        type:Number,
        required:true,
        min:1000
    }
})

addressSchema.methods.toString=function(){
    return `${this.town}, ${this.state}, ${this.country}`
}

const Address = mongoose.model("Address" , addressSchema)

module.exports=Address