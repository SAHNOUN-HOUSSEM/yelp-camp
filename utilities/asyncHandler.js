// function asyncHandler(callback){
//     return async function(req , res , next){
//         try{
//             await callback(req , res)
//         }
//         catch(err){
//             next(err)
//         }
//     }
// }

function asyncHandler(callback){
    return function(req , res , next){
        callback(req , res , next)
            // .catch((err)=>{
            //     next(err)
            // })
            .catch(next)
    }
}

module.exports=asyncHandler