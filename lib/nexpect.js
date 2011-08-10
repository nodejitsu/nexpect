/*
 * nexpect.js: Top-level include for the `nexpect` module.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */
 
var spawn = require('child_process').spawn;

function chain (context) {
  return {
    expect: function (assert) {
      context.queue.push(function (data) {
        return data.indexOf(assert) > -1;
      });
      
      return chain(context);
    },
    sendline: function (line) {
      context.queue.push(function () {
        context.process.stdin.write(line + '\n');
      });
      
      return chain(context);
    },
    run: function (callback) {
      var errState = null;

      function onError (err) {
        if (errState) {
          return;
        }
        
        errState = err;
        
        try { context.process.kill() }
        catch (ex) { }
        
        callback(err);
      }
      
      function onLine (data) {
        data = data.toString();
        
        if (module.exports.debug || module.exports.nspawn.debug) {
          process.stdout.write(data);
        }
        
        var expect = context.queue[0];

        if (!expect) {
          return;
        }
        else if (typeof expect !== 'function') {
          console.dir(expect);
          return onError('Cannot process non-function on nexpect stack.');
        }
        else if (expect(data) !== true) {
          return onError(data + ' was not expected..');
        } 

        context.queue.shift();
        var sendline = context.queue.shift();
        if (typeof sendline === 'function') {
          sendline();
        }
      };

      context.process = spawn(context.command, context.params);
      context.process.stdout.on('data', onLine);
      context.process.stdout.on('end', function () {
        callback(errState);
      });
    }
  };
};

function nspawn (command, params) {
  if (Array.isArray(command)) {
    params  = command;
    command = params.shift();
  }
  else if (typeof command === 'string') {
    command = command.split(' ');
    params  = params || command.slice(1);
    command = command[0];
  }
  
  context = {
    command: command,
    params: params,
    queue: [],
  };
  
  return chain(context);
};

//
// Export the core `nspawn` function as well as `nexpect.nspawn` for 
// backwards compatibility.
//
module.exports.spawn  = nspawn;
module.exports.nspawn = {
  spawn: nspawn
};