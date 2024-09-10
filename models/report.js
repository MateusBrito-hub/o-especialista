const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    client: String,
    imageErro: String,
    descriptionErro: String,
    solutionImage:String,
    descriptionSolution:String,
})

const Report= mongoose.model('Report', reportSchema)
module.exports = Report