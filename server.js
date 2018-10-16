var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base('appF6Zkc4Ro45xess');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/signup', (req, res) => {
  if (req.body.name === "") return res.redirect('/');
  console.log(req.body.name + " signed up");
  
  base('Signup').create({"Name": req.body.name}, function(err, record) {
    if (err) { console.error(err); return; }
    console.log("New Airtable record created: " + record.getId());
  });
  
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mattbstanciu@gmail.com',
      pass: process.env.GMAIL_PASS
    }
  });
  
  var mailOptions = {
    from: 'mattbstanciu@gmail.com',
    to: 'mattbstanciu@gmail.com',
    subject: 'New Hack Club signup!',
    text: req.body.name
  };
  transporter.sendMail(mailOptions, function(err, data) {
    if (err) return console.log(err);
    console.log("Email sent: " + data.response);
    return res.redirect('/added');
  }); 
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.get('/added', (request, response) => {
  response.sendFile(__dirname + '/views/added.html');
})

http.listen(3000);
