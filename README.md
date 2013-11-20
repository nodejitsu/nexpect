# nexpect

`nexpect` is a node.js module for spawning child applications (such as ssh) and
seamlessly controlling them using javascript callbacks. nexpect is based on the
ideas of the [expect][0] library by Don Libes and the [pexpect][1] library by
Noah Spurrier. 

## Motivation

node.js has good built in control for spawning child processes. `nexpect` builds
on these core methods and allows developers to easily pipe data to child
processes and assert the expected response. `nexpect` also chains, so you can
compose complex terminal interactions.

## Installation

``` bash
  $ npm install --save nexpect
```

## Usage

### require('nspawn')

The module exposes a single function, `.spawn`.

### function spawn (command, [params], [options])

* command {string|Array} The command that you wish to spawn, a string will be
  split on `' '` to find the params if params not provided (so do not use the
  string variant if any arguments have spaces in them)
* params {Array} **Optional** Argv to pass to the child process
* options {Object} **Optional** An object literal which may contain
  - cwd: Current working directory of the child process.
  - env: Environment variables for the child process.
  - ignoreCase: Ignores the case of any output from the child process.
  - stripColors: Strips any ANSI colors from the output for `.expect()` and `.wait()` statements.
  - stream: Expectations can be written against stdout, or stderr, but not both
    (defaults to 'stdout')
  - verbose: Writes the stdout for the child process to `process.stdout` of the current process,
    and any data sent with sendline to the `process.stdout` of the current
    process.


Top-level entry point for `nexpect` that liberally parses the arguments 
and then returns a new chain with the specified `command`, `params`, and `options`.

### function expect (str)

* str {string} Output to assert on the target stream

Adds a one-time assertion to the `context.queue` for the current chain.
 

### function wait (str)

* str {string} Output to assert on the target stream

Adds an assertion to the `context.queue` for the current chain,
that will wait until it returns true.

XXX(sam) Its not at all clear from the tests how wait() and expect() are different.

### function sendline (line)

* line {string} Output to write to the child process.

Adds a write line to `context.process.stdin` to the `context.queue`
for the current chain.

### function run (callback)

* callback {function} Called when child process closes, with arguments
  * err {Error|null} Error if any occurred
  * output {Array} Array of lines of output examined
  * exit {Number|String} Numeric exit code, or String name of signal

Runs the `context` against the specified `context.command` and 
`context.params`. 


## Example

Lets take a look at some sample usage:

``` js
  var nexpect = require('nexpect');

  nexpect.spawn("echo", ["hello"])
         .expect("hello")
         .run(function (err, stdout, exitcode) {
           if (!err) {
             console.log("hello was echoed");
           }
         });

  nexpect.spawn("ls -la /tmp/undefined")
         .expect("No such file or directory")
         .run(function (err) {
           if (!err) {
             console.log("checked that file doesn't exists");
           }
         });

  nexpect.spawn("node")
         .expect(">")
         .sendline("console.log('testing')")
         .expect("testing")
         .sendline("process.exit()")
         .run(function (err) {
           if (!err) {
             console.log("node process started, console logged, process exited");
           }
           else {
             console.log(err)
           }
         });
```

If you are looking for more examples take a look at the [examples][2], and [tests][3].

## Tests

All tests are written with [vows][4]:

``` bash
  $ npm test
```

## Authors

[Elijah Insua][5] [Marak Squires][6], and [Charlie Robbins][7].

[0]: http://search.cpan.org/~rgiersig/Expect-1.21/Expect.pod
[1]: http://pexpect.sourceforge.net/pexpect.html
[2]: https://github.com/nodejitsu/nexpect/tree/master/examples
[3]: https://github.com/nodejitsu/nexpect/tree/master/test/nexpect-test.js
[4]: http://vowsjs.org
[5]: http://github.com/tmpvar
[6]: http://github.com/marak
[7]: http://github.com/indexzero
