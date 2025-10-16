pretix_authenticate = function(){
	
//setup instructions
/*
you need the Id of the checkin list in pretix
you also need the name of the event
api key is configured in the secrets folder and this is per team
*/


var fs = require('fs');
var keys=JSON.parse(fs.readFileSync('./secret/pretix_settings.json').toString());
var self = this
self.valid_tickets=[]
var request = require('request');
var async = require('async');
var eachAsync = require('each-async');
const querystring = require('querystring');
var _ = require('underscore');

var pretix_token=keys.api_token


var checkinlist = keys.eventCheckinList[0].checkinlist_id
var event_name =  keys.eventCheckinList[0].event_name
const eventCheckinList = keys.eventCheckinList


var items =[]

var items_to_add= keys.limit_to_items.join(",")

const https = require('https');

function fetchTickets(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Authorization': 'Token ' + pretix_token } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
        	console.log("[fetchTickets] ",err)
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

self.connect = async function() {
  let url = `https://pretix.eu/api/v1/organizers/bristolmuseums/events/${event_name}/checkinlists/${checkinlist}/positions/?item__in=${items_to_add}`;
  self.valid_tickets = [];

  while (url) {

    try {
      const data = await fetchTickets(url);
      data.results.forEach(line => {
        if (items_to_add.length === 0 || items_to_add.includes(line.item)) {
          self.valid_tickets.push(line.secret);
        
        }
      });
      url = data.next;
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      break;
    }
  }
 console.log('found'+ self.valid_tickets.length + ' tickets')
  return self.valid_tickets;
};





//check pretix_settings.JSON for event ids and corresponding checkin lists - the app can validate against three different events using the below functions
self.single_ticket_test_loop = function(checkinlist_id,event_code,ticketQR,cb){
	
	self._single_ticket_test(event_code,checkinlist_id,ticketQR,cb)	

}


self._single_ticket_test = function(_event_name,_checkinlist,ticketQR,cb) {

const https = require('https')
const options2 = {
  hostname: 'pretix.eu',
  path: '/api/v1/organizers/bristolmuseums/events/'+_event_name+'/checkinlists/'+_checkinlist+'/positions/'+'?secret='+ticketQR,
   // path: '/api/v1/organizers/bristolmuseums/events/'+event_name+'/checkinlists/'+checkinlist+'/positions/'
 method: 'GET',
  headers: {
     'Authorization': 'Token '+pretix_token
  }
}		
console.log(options2.path)




const req = https.request(options2, res => {
 console.log(`statusCode: ${res.statusCode}`)

  let body=""
  res.on('data', chunk => {
   body += chunk;	
  })
  
  
   res.on("end", () => {
        try {
            let checklist_data = JSON.parse(body);
            //return count of matching tickets	
			console.log('found ' + checklist_data.count + ' matching tickets')			
			if(checklist_data.count==1){
					console.log('event item ' + checklist_data.results[0].item)		
if (items_to_add.length>0 && items_to_add.indexOf(checklist_data.results[0].item)!=-1) {
	
 cb(true)	
			}
			
		else if(items_to_add.length==0){
		 cb(true)		
		}
			else{
			 cb(false)	
			}
		
			} else{
				cb(false)
			}
        } catch (error) {
            console.error(error.message);
        };
    });
})

req.on('error', error => {
  console.error(error)
})

req.end()
// cb()
}














self.test_ticket = function(data) {
	
	open_serialport.simulate(data.ticket)
}

function orders(next_url,cb){
	
	
	
	var current_page = 0
	
	 function getNextset(next_url) {
			
			var return_product_type = ""

			request({
				url: next_url,
				timeout:5000,
				  headers: {
					'Authorization': 'Token '+pretix_token
				},
				
				//json: true
			}, function (error, response, body) {
					
			

  if (error) {
    if (error.code === 'ESOCKETTIMEDOUT') {
      console.warn('Request timed out. Retrying or logging...');
    } else {
      console.error('Unexpected error:', error);
    }
  } else {
    
	//console.log(JSON.stringify(body.output, null, 2));
	
  }

				//if(response) console.log(response.statusCode)
				if (!error && response.statusCode === 200) {
	
						let checklist_data = JSON.parse(body);
						
						 _.each(checklist_data.results, function (line,i) {
								// add ticket codes to an arra
								if(items_to_add.length>0 && items_to_add.indexOf(line.item)!=-1){
									console.log('limiting ticket database to pretix product with product ID'+line.item)
									//console.log(line.secret)
									console.log(line.checkins)
									self.valid_tickets.push(line.secret)	
								}
								else if( items_to_add.length==0){
									self.valid_tickets.push(line.secret)		
								}   	
											
						})																		
	
			
						setTimeout(function (){
							if(checklist_data.next){
							getNextset(checklist_data.next)	
							}
							else
							{
							console.log('finished looping...',self.valid_tickets.length + " tickets found with priduct_ids "+items_to_add )
							cb( self.valid_tickets)
							}	
		
						}, 1000);
						
					
					
				}
				
			})	
		}
		
getNextset(next_url)	
console.log(" we're going to download all tickets from the event for faster scanning - this could take a while")
}


}

module.exports = pretix_authenticate;