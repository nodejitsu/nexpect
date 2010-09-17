<pre>
                                       _   
                                      | |  
 _ __    ___ __  __ _ __    ___   ___ | |_ 
| '_ \  / _ \\ \/ /| '_ \  / _ \ / __|| __|
| | | ||  __/ >  < | |_) ||  __/| (__ | |_ 
|_| |_| \___|/_/\_\| .__/  \___| \___| \__|
                   | |                     
                   |_|                     
</pre>

nexpect is a node.js module for spawning child applications and seamlessly controlling them using javascript callbacks. nexpect can be used for automating terminal applications such as ssh, ftp, passwd, telnet, etc. nExpect is based on the ideas of the Expect library by Don
Libes and the pexpect library by Noah Spurrier. 


It can be used to a automate setup
scripts for duplicating software package installations on different servers. It
can be used for automated software testing.

## installation

### installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### installing nexpect
<pre>
  npm install nexpect
</pre>

# usage

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


# authors



tmpvar and Marak


[]

http://search.cpan.org/~rgiersig/Expect-1.21/Expect.pod
http://pexpect.sourceforge.net/pexpect.html