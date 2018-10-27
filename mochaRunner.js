const Mocha = require('mocha')
const mocha = new Mocha({
    reporter: 'mochawesome',
    reporterOptions:{
        reportDir: './reporter/api',
        reportFilename: 'reporter'
    }
})

mocha.addFile('./server/test.spec.js')
mocha.run(function(){
    console.log('done')
    process.exit()
})