/*
 * nexpect.js: Top-level include for the `nexpect` module.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */
 
var spawn = require('child_process').spawn;

function chain (context) {
  return {
    expect: function(str) {
      context.queue.push(function (data) {
        return data.indexOf(str) > -1;
      });
      
      return chain(context);
    },
    sendline: function (str) {
      context.queue.push(function () {
        context.process.stdin.write(str + '\n');
      });
      
      return chain(context);
    },
    run: function(fn) {
      var err = null;
      
      function out (data) {
        data = data.toString();
        var expect = context.queue[0];

        if (typeof expect !== 'function' || expect(data) !== true) {
          err = data + ' was not expected..';
        } 
        else {
          context.queue.shift();
          var sendline = context.queue.shift();
          if (typeof sendline === 'function') {
            sendline();
          }
        }
      };

      context.process = spawn(context.app, context.args);
      context.process.stdout.on('data', out);
      context.process.stdout.on('end', function () {
        fn(err);
      });
    }
  };
};

function nspawn (cmd) {
  var args = Array.isArray(cmd) ? cmd : cmd.split(' '),
      app  = args.shift(),
      context;

  context = {
    app: app,
    args: args,
    queue: [],
  };
  
  return chain(context);
};

//
// Export the core `nspawn` function as well as `nexpect.nspawn` for 
// backwards compatibility.
//
module.exports = nspawn;
module.exports.nspawn = nspawn;