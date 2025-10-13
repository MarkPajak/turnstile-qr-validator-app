const request = require("request");
const { MongoClient } = require('mongodb');
const { SerialPort } = require('serialport');
const fs = require('fs');
const Pretix = require('./pretix-authenticate.js');
const Save_csv = require('./save-csv.js');
const save_csv = new Save_csv();

//const keys = JSON.parse(fs.readFileSync('./secret/api_keys.JSON').toString());
const settings = JSON.parse(fs.readFileSync('./secret/pretix_settings.JSON').toString());

const eventCheckinList = settings.eventCheckinList;

save_csv.savecsv('save cheese');

let globalBuffer = '';
let port;

const open_turnstile_command = "G2:01";

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const openOptions = {
  baudRate: settings.baudRate || 9600,
  dataBits: settings.dataBits || 8,
  parity: settings.parity || 'none',
  stopBits: settings.stopBits || 1,
  path: settings.serialPort || '/tmp/ttyV0'   // Use the virtual port
};

function logAccessAttempt(data) {
  return request({
    uri: `https://${keys[process.env.venue].remote_ticket_log}/turnstiles_logging`,
    method: "POST",
    form: data
  }, (error, response) => {
    if (error) {
      console.error("Logging ERROR:", error);
    } else {
      console.log('Remote log status:', response.statusCode);
    }
  });
}

function validateTicket(ticketQR) {
  console.log("allow_any_code set to", settings.allow_any_code);
  if (settings.allow_any_code == true) {
    console.log("Allowing all tickets through (debug mode).");
    return true;
  } else {
    if (global.valid_ticket_types?.csvTickets?.includes(ticketQR.toString())) {
      console.log('Ticket found in CSV ticket database');
      return true;
    } else {
      console.log('Ticket not found in CSV tickets');
      return false;
    }
  }
}

async function openSerialPort() {
  if (!port || !port.isOpen) {
    port = new SerialPort({ ...openOptions, autoOpen: true }, (err) => {
      if (err) {
        return console.error('Failed to open port:', err.message);
      }
    });
  }
  return new Promise((resolve, reject) => {
    port.write(open_turnstile_command, (err) => {
      if (err) {
        console.error('Error writing to serial port:', err.message);
        return reject(err);
      }
      console.log('Gate open command sent successfully.',open_turnstile_command);
       console.log('---------------------------SUCCESS-----------------------------------');
      resolve();
    });
  });
}

async function useTicket(ticket, success) {
  try {
    await client.connect();
    const db = client.db('tickets');
    const collection = db.collection('myCollectionName');

    const doc = { _id: ticket, date_scanned: new Date(), scan_attempts: 1, status_code: success };
    
    await collection.updateOne({ _id: ticket }, { $setOnInsert: doc }, { upsert: true });
    
    await collection.insertOne(doc).catch(err => {
      if (err.code === 11000) { // Duplicate key error, ignore
        console.log('Duplicate ticket insert ignored.');
      } else {
        throw err;
      }
    });

    console.log(`Ticket ${ticket} logged with status: ${success}`);
  } catch (err) {
    console.error('Error logging ticket to DB:', err);
  } finally {
    await client.close();
  }
}

async function checkTicketHistory(ticket) {
  try {
    await client.connect();
    const db = client.db('tickets');
    const collection = db.collection('myCollectionName');

    const doc = await collection.findOne({ _id: ticket });

    if (doc) {
      console.log(`Ticket ${ticket} scanned ${doc.scan_attempts} times already.`);
      if (doc.scan_attempts >= (settings.maximum_scans_per_ticket || 1)) {
        console.log("Maximum scan limit exceeded");
        return { valid: false, reason: 'max_scans_exceeded', firstScanDate: doc.date_first_scan };
      }
      await collection.updateOne({ _id: ticket }, {
        $inc: { scan_attempts: 1 },
        $set: { date_last_attempt: new Date() }
      });
      return { valid: true, previouslyScanned: true };
    } else {
      return { valid: true, previouslyScanned: false };
    }
  } catch (err) {
    console.error('Error checking ticket history:', err);
    return { valid: false, reason: 'db_error' };
  } finally {
    await client.close();
  }
}

function checkIfPretixTicket(code) {
  if (code.length === 32) {
    console.log('Looks like a Pretix ticket');
    return true;
  } else {
    console.log('Not a Pretix ticket');
    return false;
  }
}

function simulate(data) {
  console.log('---------------------------------------------');
  console.log('Received ticket:', data);

  checkTicketHistory(data).then(historyResult => {
    if (!historyResult.valid) {
      console.log('Ticket rejected:', historyResult.reason);
      useTicket(data, 'FAIL');
      return;
    }

    if (validateTicket(data)) {
      console.log('Ticket valid in saved ticket database');
      openSerialPort().then(() => useTicket(data, 'open'));
      return;
    }

    if (checkIfPretixTicket(data)) {
      let index = 0;
      let validated = false;

      const checkNext = () => {
        if (index >= eventCheckinList.length) {
          if (!validated) {
            console.log('Cannot match ticket to live database. Giving up.');
            useTicket(data, 'FAIL');
          }
          return;
        }

        const item = eventCheckinList[index];
        const pretix = new Pretix();
        pretix.single_ticket_test_loop(item.checkinlist_id, item.event_name, data, (cb) => {
          if (cb === true) {
            console.log('Ticket is valid in live Pretix database');
            openSerialPort().then(() => useTicket(data, 'open'));
            validated = true;
          } else {
            index++;
            checkNext();
          }
        });
      };
      checkNext();
    } else {
      console.log('Ticket does not match any known formats or databases.');
      useTicket(data, 'FAIL');
    }
  }).catch(err => {
    console.error('Error during ticket simulation:', err);
    useTicket(data, 'FAIL');
  });
}

function listenData() {

  port = new SerialPort({ ...openOptions, autoOpen: true });
 
  port.on('data', chunk => {

    const dataStr = chunk.toString();



    if (dataStr.includes("R2:")) {
      globalBuffer = '';
    }

    globalBuffer += dataStr;

   // let lines = globalBuffer.split('\n');   //put back in on live turnstile - chunking
   // globalBuffer = lines.pop();             //put back in on live turnstile- chunking

   // if (globalBuffer != dataStr) {
     

      const result = globalBuffer.replace("R2:", "").trim();
console.log('ersult.length:',result.length )
      if (result.length ==32) {
        console.log("Pretix ticket detected");
        simulate(result);
        globalBuffer = '';
      } else {
        console.log("Received data does not look like a valid ticket code");
      }
    //}
  });

  port.on('error', err => {
    console.error('Serial port error:', err);
  });
}

module.exports = function open_turnstile(valid_ticket_types) {
  global.valid_ticket_types = valid_ticket_types;

  return {
    listenData,
    simulate,
    openSerialPort,
    useTicket,
    logAccessAttempt,
  };
};
