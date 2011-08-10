# nexpect

`nexpect` is a node.js module for spawning child applications (such as ssh) and seamlessly controlling them using javascript callbacks. nexpect is based on the ideas of the [expect][0] library by Don Libes and the [pexpect][1] library by Noah Spurrier. 

## Motivation

node.js has good built in control for spawning child processes. `nexpect` builds on these core methods and allows developers to easily pipe data to child processes and assert the expected response. `nexpect` also chains, so you can compose complex terminal interactions.

## Installation

### Installing npm (node package manager)
``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing nexpect
``` bash
  $ npm install nexpect
```

## Usage

### Basic usage

The core method, `nexpect.spawn(command, [params], [options])`, takes three parameters: 

* command: The command that you wish to spawn
* params: The argv that you want to pass to the child process
* options: An object literal which may contain
  - cwd: Current working directory of the child process.
  - ignoreCase: Ignores the case of any output from the child process.
  - stripColors: Strips any ANSI colors from the output for `.expect()` and `.wait()` statements.
  - verbose: Writes the stdout for the child process to `process.stdout` of the current process.
  
  
  
Lets take a look at some sample usage:

``` js
  var nexpect = require('nexpect');

  nexpect.spawn("echo", ["hello"])
         .expect("hello")
         .run(function (err) {
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