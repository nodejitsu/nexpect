#nexpect

nexpect is a node.js module for spawning child applications (such as ssh) and seamlessly controlling them using javascript callbacks. nexpect is based on the ideas of the [expect][0] library by Don Libes and the [pexpect][1] library by Noah Spurrier. 

## why

node.js has good built in control for spawning child processes. nexpect builds on these core methods and allows developers to easily pipe data to child processes and assert the expected response. nexpect also chains, so you can compose complex terminal interactions.

## installation

### installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### installing nexpect
<pre>
  npm install nexpect
</pre>

## usage

      var nexpect = require('./lib/nexpect').nspawn;
      
      nexpect.spawn("echo hello")
             .expect("hello")
             .run(function(err) {
                if (!err) {
                  console.log("hello was echoed");
                }
             });

      nexpect.spawn("ls -al /tmp/undefined")
             .expect("No such file or directory")
             .run(function(err) {
                if (!err) {
                  console.log("checked that file doesn't exists");
                }
             });

      nexpect.spawn("node")
            .expect("Type '.help' for options.")
            .sendline("console.log('testing')")
            .expect("testing")
            .sendline("process.exit()")
            .run(function(err) {
              if (!err) {
                console.log("node process started, console logged, process exited");
              } else {
                console.log(err)
              }
            });


# authors

[Elijah Insua][2] and [Marak Squires][3]

Copyright (c) 2010 Elijah Insua, Marak Squires  http://github.com/nodejitsu/nexpect

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[0]: http://search.cpan.org/~rgiersig/Expect-1.21/Expect.pod "expect"
[1]: http://pexpect.sourceforge.net/pexpect.html "pexpect"
[2]: http://github.com/tmpvar "Elijah Insua"
[3]: http://github.com/marak "Marak Squires"


