/*
 * nexpect.js: Top-level include for the `nexpect` module.
 *
 * (C) 2011, Elijah Insua, Marak Squires, Charlie Robbins.
 *
 */
 
var spawn = require('child_process').spawn;

function chain (context) {
  return {
    //
    // ### function expect (str)
    // #### @str {string} Output to assert on the target stream
    // Adds a one-time assertion to the `context.queue` for the current chain.
    //
    expect: function (str) {
      var _expect = function _expect (data) {
        return data.indexOf(str) > -1;
      };
      
      _expect.shift = true;
      context.queue.push(_expect);
      
      return chain(context);
    },
    //
    // ### function wait (str)
    // #### @str {string} Output to assert on the target stream
    // Adds an assertion to the `context.queue` for the current chain,
    // that will wait until it returns true.
    //
    wait: function (str) {
      var _wait = function _wait (data) {
        return data.indexOf(str) > -1;
      };
      
      _wait.shift = false;
      context.queue.push(_wait);
      return chain(context);
    },
    //
    // ### function sendline (line)
    // #### @line {string} Output to write to the child process.
    // Adds a write line to `context.process.stdin` to the `context.queue`
    // for the current chain.
    //
    sendline: function (line) {
      var _sendline = function _sendline () {
        context.process.stdin.write(line + '\n');
        
        if (context.verbose) {
          process.stdout.write(line + '\n');
        }
      };
      
      _sendline.shift = true;
      context.queue.push(_sendline);
      return chain(context);
    },
    //
    // ### function run (callback)
    // #### @callback {function} Continuation to respond to when complete
    // Runs the `context` against the specified `context.command` and 
    // `context.params`. 
    //
    run: function (callback) {
      var errState = null,
          responded = false,
          stdout = [],
          options;

      //
      // **onError**
      //
      // Helper function to respond to the callback with a 
      // specified error. Kills the child process if necessary.
      //
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
      
      //
      // **validateFnType**
      //
      // Helper function to validate the `currentFn` in the 
      // `context.queue` for the target chain.
      //
      function validateFnType (currentFn) {
        if (typeof currentFn !== 'function') {
          //
          // If the `currentFn` is not a function, short-circuit with an error.
          //
          onError(new Error('Cannot process non-function on nexpect stack.'), true);
          return false;
        }
        else if (['_expect', '_sendline', '_wait'].indexOf(currentFn.name) === -1) {
          //
          // If the `currentFn` is a function, but not those set by `.sendline()` or 
          // `.expect()` then short-circuit with an error.
          //
          onError(new Error('Unexpected context function name: ' + currentFn.name), true);
          return false; 
        }
        
        return true;
      }
      
      //
      // **evalContext**
      //
      // Core evaluation logic that evaluates the next function in 
      // `context.queue` against the specified `data` where the last
      // function run had `name`.
      //
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
        
        if (!validateFnType(currentFn)) {
          return;
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
      
      //
      // **onLine**
      //
      // Preprocesses the `data` from `context.process` on the 
      // specified `context.stream` and then evaluates the processed lines: 
      // 
      // 1. Stripping ANSI colors (if necessary)
      // 2. Removing case sensitivity (if necessary)
      // 3. Splitting `data` into multiple lines.
      //
      function onLine (data) {
        data = data.toString();
        
        if (context.stripColors) {
          data = data.replace(/\u001b\[\d{0,2}m/g, '');
        }
        
        if (context.ignoreCase) {
          data = data.toLowerCase();
        }
        
        var lines = data.split('\n').filter(function (line) { return line.length > 0 });
        stdout = stdout.concat(lines);
        
        while (lines.length > 0) {
          evalContext(lines.shift(), null);
        }
      }
      
      //
      // **flushQueue**
      //
      // Helper function which flushes any remaining functions from 
      // `context.queue` and responds to the `callback` accordingly.
      //
      function flushQueue () {
        var currentFn = context.queue.shift(),
            lastLine = stdout[stdout.length - 1];
            
        if (!lastLine) {
          onError(new Error('No data from child with non-empty queue.'))
          return false; 
        }
        else if (context.queue.length > 0) {
          onError(new Error('Non-empty queue on spawn exit.'));
          return false;
        }
        else if (!validateFnType(currentFn)) {
          return false;
        }
        else if (currentFn.name === '_sendline') {
          onError(new Error('Cannot call sendline after the process has exited'));
          return false;
        }
        else if (currentFn.name === '_wait' || currentFn.name === '_expect') {
          if (currentFn(lastLine) !== true) {
            onError(new Error(lastLine + ' was not expected..'));
            return false
          }
        }
        
        return true;
      }
      
      //
      // **onData**
      //
      // Helper function for writing any data from a stream 
      // to `process.stdout`.
      //
      function onData (data) {
        process.stdout.write(data);
      }

      if (context.cwd) {
        options = { cwd: context.cwd };
      }

      //
      // Spawn the child process and begin processing the target
      // stream for this chain.
      //
      context.process = spawn(context.command, context.params, options);
      
      if (context.verbose) {
        context.process.stdout.on('data', onData);
        context.process.stderr.on('data', onData);
      }
      
      context.process[context.stream].on('data', onLine);
      
      //
      // When the process exits, check the output `code` and `signal`,
      // flush `context.queue` (if necessary) and respond to the callback
      // appropriately.
      //
      context.process.on('exit', function (code, signal) {
        if (code === 127) {
          //
          // If the response code is `127` then `context.command` was not found.
          //
          return onError(new Error('Command not found: ' + context.command));
        }
        else if (context.queue.length && !flushQueue()) {
          return;
        }
        
        callback(null, stdout);
      });
            
      return context.process;
    }
  };
};

//
// ### function nspawn (command, [params], [options])
// #### @command {string|Array} Command or complete set of params to spawn
// #### @params {Array} **Optional** Argv to pass to the child process
// #### @options {Object} **Optional** Additional options for spawning the child process.
// Top-level entry point for `nexpect` that liberally parses the arguments 
// and then returns a new chain with the specified `command`, `params`, and `options`.
//
function nspawn (command, params, options) {
  if (arguments.length === 2) {
    if (Array.isArray(arguments[1])) {
      options = {};
    } 
    else {
      options = arguments[1];
      params = null;
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
    cwd: options.cwd || undefined,
    ignoreCase: options.ignoreCase,
    params: params,
    queue: [],
    stream: options.stream || 'stdout',
    stripColors: options.stripColors,
    verbose: options.verbose
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