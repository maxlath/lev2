var spawn = require('child_process').spawn;
var path = require('path');
var levelup = require('levelup');
var test = require('tap').test;
var p = path.join(__dirname, '..', 'fixtures', 'db');

var options = {};
var OK = 'OK\r\n';


const test_key1 = 'testkey1';
const test_value1 = 'testvalue1';
const test_key2 = 'testkey2';
const test_value2 = 'testvalue2';
const test_key3 = 'testkey3';
const test_value3 = 'testvalue3';
const test_key4 = 'testkey4';
const test_value4 = 'testvalue4';

module.exports = {

  "put to specific location (verbose argument)": function(test, next) {

    test.plan(2);

    var test_cp2 = spawn('lev', ['--put', test_key2, test_value2, '--createIfMissing', '--location', p]);
    var test_output2 = '';

    test_cp2.stderr.on('data', function (data) {
      test.fail(data);
    });

    test_cp2.stdout.on('data', function (data) {
      test_output2 += data;
    });

    test_cp2.on('exit', function (data) {
  
      test.equals(test_output2, OK);

      levelup(path.join(__dirname, '..', 'fixtures', 'db'), options, function (err, db) {
        
        if (err) { return test.fail(err); }

        db.get(test_key2, function (err, value) {
          
          if (err) { return test.fail(err); }
          test.equals(test_value2, value);
          db.close();
          next();
        });
      });
    });
  },

  "put to specific location": function(test, next) {

    test.plan(2);

    var test_cp1 = spawn('lev', ['-p', test_key1, test_value1, '--location', p]);
    var test_output1 = '';

    test_cp1.stderr.on('data', function (data) {
      test.fail(String(data));
    });

    test_cp1.stdout.on('data', function (data) {
      test_output1 += data;
    });

    test_cp1.on('exit', function (data) {

      test.equals(test_output1, OK);

      levelup(p, options, function (err, db) {
      
        if (err) { return test.fail(err); }

        db.get(test_key1, function (err, value) {
          
          if (err) { return test.fail(err); }
          test.equals(test_value1, value);
          db.close();
          next();
        });
      });
    });
  },

  "put from within the current working dir": function(test, next) {

    test.plan(2);

    var test_cp3 = spawn('lev', ['-p', test_key3, test_value3], { cwd: p });
    var test_output3 = '';

    test_cp3.stderr.on('data', function (data) {
      test.fail(String(data));
    });

    test_cp3.stdout.on('data', function (data) {
      test_output3 += data;
    });

    test_cp3.on('exit', function (data) {

      test.equals(test_output3, OK);

      levelup(p, options, function (err, db) {
        
        if (err) { return test.fail(err); }

        db.get(test_key3, function (err, value) {
          
          if (err) { return test.fail(err); }
          test.equals(test_value3, value);
          db.close();
          next();
        });
      });
    });
  },

  "put from within the current working dir (verbose argument)": function(test, next) {

    test.plan(2);

    var test_cp4 = spawn('lev', ['-p', test_key4, test_value4], { cwd: p });
    var test_output4 = '';

    test_cp4.stderr.on('data', function (data) {
      test.fail(String(data));
    });

    test_cp4.stdout.on('data', function (data) {
      test_output4 += data;
    });

    test_cp4.on('exit', function (data) {

      test.equals(test_output4, OK);

      levelup(p, options, function (err, db) {
        
        if (err) { return test.fail(err); }

        db.get(test_key4, function (err, value) {
          
          if (err) { return test.fail(err); }
          test.equals(test_value4, value);
          db.close();
          next();
        });
      });
    });
  },

  "get from specific location": function(test, next) {

    test.plan(1);

    var test_cp1 = spawn('lev', ['-g', test_key1, '--location', p]);
    var test_output1 = '';

    test_cp1.stderr.on('data', function (data) {
      test.fail(String(data));
    });

    test_cp1.stdout.on('data', function (data) {
      test_output1 += data;
    });

    test_cp1.on('exit', function (data) {

      test.equals(test_output1, test_value1);
    });
  },

  "get from specific location (verbose argument)": function(test, next) {

    test.plan(1);

    var test_cp2 = spawn('lev', ['--get', test_key2, '--location', p]);
    var test_output2 = '';

    test_cp2.stderr.on('data', function (data) {
      test.fail(data);
    });

    test_cp2.stdout.on('data', function (data) {
      test_output2 += data;
    });

    test_cp2.on('exit', function (data) {
  
      test.equals(test_output2, test_value2);
    });
  },

  "delete a key": function(test, next) {

    test.plan(2);

    var test_cp3 = spawn('lev', ['-d', test_key3], { cwd: p });
    var test_output3 = '';

    test_cp3.stderr.on('data', function (data) {
      test.fail(String(data));
    });

    test_cp3.stdout.on('data', function (data) {
      test_output3 += data;
    });

    test_cp3.on('exit', function (data) {

      test.equals(test_output3, OK);

      levelup(p, options, function (err, db) {
        
        if (err) { return test.fail(err); }

        db.get(test_key3, function (err, value) {
          
          if (err) { 
            test.ok(true); 
            db.close();
            next();
          }
          else {
            test.equals(test_value3, value);
          }

        });
      });
    });
  }

};