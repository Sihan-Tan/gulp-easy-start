const Mocha = require('mocha')
const mocha = new Mocha({
    reporter: 'mochawesome',
    reporterOptions:{
        reportDir: './coverage/mocha',
        reportFilename: 'reporter'
    }
})

mocha.addFile('./mocha/test.spec.js')
mocha.run(function(){
    console.log('done')
    process.exit()
})