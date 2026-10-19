'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');
require('dotenv').config();

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

let app = express();

const path = require('path');
const fs   = require('fs');

const getFilePath = (folder, file) => {
  const p1 = path.join(__dirname, folder, file);
  if (fs.existsSync(p1)) return p1;
  return path.join(process.cwd(), folder, file);
};

const publicDir = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(process.cwd(), 'public');
app.use('/public', express.static(publicDir));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(getFilePath('views', 'issue.html'));
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(getFilePath('views', 'index.html'));
  });

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Trigger test runner on-demand if get-tests requested before timer
app.use('/_api/get-tests', function (req, res, next) {
  if (process.env.NODE_ENV === 'test' && !runner.report) {
    try {
      runner.run();
    } catch (e) {
      console.error(e);
    }
  }
  next();
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  const listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          console.log('Tests are not valid:');
          console.error(e);
        }
      }, 1500);
    }
  });
  listener.on('error', function(err) {
    if (err.code !== 'EADDRINUSE') {
      console.error(err);
    }
  });
}

module.exports = app; //for testing
