var turnstiles_web_controller = function() {
  var self = this;

  const ValidTicketsFile = require('./csv-ticket-codes');
  const Database = require('./database.js');
  const Pretix = require('./pretix-authenticate.js');


self.connect = async function(port, cb) {
  const database = new Database();
  const pretix = new Pretix();

  try {
    // Await pretix
    const online_tickets = await pretix.connect();
    console.log('pretix connected – got', online_tickets.length, 'tickets');

    // Await database
    const scanned_tickets = await database.connect();
    console.log('database connected – got', scanned_tickets.length, 'tickets');

    // Load CSV tickets
    const valid_tickets_from_file = new ValidTicketsFile();

    valid_tickets_from_file.load_tickets((tickets) => {
      console.log('      |/   \\|');
      console.log('      \\()//');
      console.log('    //(  )\\');
      console.log('    |\\ "" /|');

      const csv_tickets = tickets;
      const all_tickets = csv_tickets.concat(online_tickets);

      console.log('Merging online and CSV tickets');

      const valid_ticket_types = {
        product_id: 8593353416,
        product_type: "Exhibition ticket",
        csvTickets: all_tickets,
        ticketfile: csv_tickets
      };

      global.valid_ticket_types = valid_ticket_types;
      //console.log(valid_ticket_types, ' valid tickets saved')

      if (cb) cb();
    });
  } catch (err) {
    console.error('Error during controller connect:', err);
  }
};
  self.test_ticket = function(data) {
    open_serialport.simulate(data.ticket);
  };

  self.simulate = function() {
    setTimeout(function() {
      let i = 0;

      const shopify = 4548779848;
      const csv_file = "ticket1";
      const csv_file2 = "QWERTY18";

      const test_tickets = [shopify, csv_file, csv_file2];

      setInterval(function() {
        if (i >= test_tickets.length) i = 0;
        open_serialport.simulate(test_tickets[i]);
        i++;
      }, 5000);
    }, 5000);
  };
};

module.exports = turnstiles_web_controller;
