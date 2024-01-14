const getAllIds = async (model) => {
    const allDocs = await model.find()
    const allIds = allDocs.map(doc => doc._id)
    return allIds
}


module.exports = getAllIds