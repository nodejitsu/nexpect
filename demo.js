/* demo.js */

var nexpect = require('./lib/nexpect').nspawn;

console.log('echo hello');
nexpect.spawn("echo hello")
       .expect("hello")
       .run(function(err) {
          if (!err) {
            console.log("hello was echoed");
          }
       });

console.log('ls -al /tmp/undefined');
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
