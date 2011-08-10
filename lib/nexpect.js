/*
 * nexpect.js: Top-level include for the `nexpect` module.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */
 
var spawn = require('child_process').spawn;

function chain (context) {
  return {
    expect: function (str) {
      var _expect = function _expect (data) {
        return data.indexOf(str) > -1;
      };
      
      _expect.shift = true;
      context.queue.push(_expect);
      
      return chain(context);
    },
    sendline: function (line) {
      var _sendline = function _sendline () {
        context.process.stdin.write(line + '\n');
      };
      
      _sendline.shift = true;
      context.queue.push(_sendline);
      
      return chain(context);
    },
    wait: function (str) {
      var _wait = function _wait (data) {
        return data.indexOf(str) > -1;
      };
      
      _wait.shift = false;
      context.queue.push(_wait);
      return chain(context);
    },
    run: function (callback) {
      var errState = null,
          responded = false, 
          stdout = [];

      function onError (err, kill) {
        if (errState || responded) {
          return;
        }
        
        errState = err;
        responded = true;
        
        if (kill) {
          try { context.process.kill() }
          catch (ex) { }
        }

        callback(err);
      }
      
      function evalContext (data, name) {
        var currentFn = context.queue[0];
                
        if (!currentFn || (name === '_expect' && currentFn.name === '_expect')) {
          //
          // If there is nothing left on the context or we are trying to 
          // evaluate two consecutive `_expect` functions, return.
          //
          return;
        }
        
        if (currentFn.shift) {
          context.queue.shift();
        }
        
        if (typeof currentFn !== 'function') {
          //
          // If the `currentFn` is not a function, short-circuit with an error.
          //
          return onError(new Error('Cannot process non-function on nexpect stack.'), true);
        }
        else if (['_expect', '_sendline', '_wait'].indexOf(currentFn.name) === -1) {
          //
          // If the `currentFn` is a function, but not those set by `.sendline()` or 
          // `.expect()` then short-circuit with an error.
          //
          return onError(new Error('Unexpected context function name: ' + currentFn.name), true);
        }
        
        if (currentFn.name === '_expect') {
          //
          // If this is an `_expect` function, then evaluate it and attempt
          // to evaluate the next function (in case it is a `_sendline` function).
          //
          return currentFn(data) === true
            ? evalContext(data, '_expect')
            : onError(new Error(data + ' was not expected..'), true);
        }
        else if (currentFn.name === '_wait') {
          //
          // If this is a `_wait` function, then evaluate it and if it returns true,
          // then evaluate the function (in case it is a `_sendline` function).
          //
          if (currentFn(data) === true) {
            context.queue.shift();
            evalContext(data, '_expect');
          }
        }
        else if (currentFn.name === '_sendline') {
          //
          // If the `currentFn` is a `_sendline` function then evaluate
          // it and return.
          //
          currentFn();
        }
      }
      
      function onLine (data) {
        data = data.toString();
        
        if (context.verbose) {
          process.stdout.write(data);
        }
        
        if (context.stripColors) {
          data = data.replace(/\u001b\[\d{0,2}m/g, '');
        }
        
        if (context.ignoreCase) {
          data = data.toLowerCase();
        }
                
        stdout = stdout.concat(data.split('\n').filter(function (line) { line !== '' }));
        evalContext(data, null);
      };

      context.process = spawn(context.command, context.params);
      context.process.stdout.on('data', onLine);
      context.process.on('exit', function (code, signal) {
        if (code === 127) {
          //
          // If the response code is `127` then `context.command` was not found.
          //
          return onError(new Error('Command not found: ' + context.command));
        }
        
        callback(null, stdout);
      });
            
      return context.process;
    }
  };
};

function nspawn (command, params, options) {
  if (arguments.length === 2) {
    if (Array.isArray(arguments[1])) {
      params = arguments[1];
      options = {};
    } 
    else {
      params = [];
      options = arguments[1];
    }
  }
  
  if (Array.isArray(command)) {
    params  = command;
    command = params.shift();
  }
  else if (typeof command === 'string') {
    command = command.split(' ');
    params  = params || command.slice(1);
    command = command[0];
  }
  
  options = options || {};
  context = {
    command: command,
    params: params,
    queue: [],
    verbose: options.verbose,
    stripColors: options.stripColors,
    ignoreCase: options.ignoreCase
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