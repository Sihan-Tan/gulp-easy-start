const autocannon = require('autocannon')
const reporter = require('autocannon-reporter')
const path = require('path')
const reportOutputPath = path.join(__dirname + '/reporter/pv', 'report.html')
autocannon(
  {
    url: "http://www.baidu.com",
    connections: 10, //default
    pipelining: 1, // default
    duration: 5 // default
  },
  (err, result) => {
    if (err) {
      throw err;
    }

    result = reporter.buildReport(result); // the html structure
    reporter.writeReport(result, reportOutputPath, (err, res) => {
      if (err) {
        console.error("Error writting report: ", err);
      } else {
        console.log("Report written to: ", reportOutputPath);
      }
    }); //write the report
  }
);
