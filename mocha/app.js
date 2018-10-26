let express = require('express')
let app = express()
app.get('/test', function(req, res) {
    res.send({
        data: 'Hello World'
    })
})
let server = app.listen(3000, function(){
    console.log('Server Start')
})
module.exports = app