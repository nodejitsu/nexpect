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

# Authors
[Elijah Insua][2] [Marak Squires][3], and [Charlie Robbins][4].

[0]: http://search.cpan.org/~rgiersig/Expect-1.21/Expect.pod "expect"
[1]: http://pexpect.sourceforge.net/pexpect.html "pexpect"
[2]: http://github.com/tmpvar "Elijah Insua"
[3]: http://github.com/marak "Marak Squires"
[4]: http://github.com/indexzero "Charlie Robbins"