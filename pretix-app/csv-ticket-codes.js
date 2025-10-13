



const fs = require('fs');
const { parse } = require('csv-parse');
const _ = require('underscore');

class ValidTicketsFile {
  constructor() {
    this.valid_tickets = [];
    this.inputFile = './ticket_files/scan_data.csv';
  }

  load_tickets(cb) {
    const parser = parse({ delimiter: ',' }, (err, data) => {
      if (err) {
        console.error("Parse error:", err);
        return cb([]);
      }

      _.each(data, (line) => {
        this.valid_tickets.push(line[0]);
      });

      console.log('ticket file loaded',this.valid_tickets.length,'tickets');
      cb(this.valid_tickets);
    });

    const stream = fs.createReadStream(this.inputFile);
    stream.on('error', (error) => {
      console.error("Error reading file:", error);
      cb([]);
    });

    stream.pipe(parser);
  }
}

module.exports = ValidTicketsFile;
