## Overview ##

Origami begins to replace the default SilverStripe admin with a responsive, reactive, event driven javascript interface.

Origami aims to improve the SilverStripe CMS experience by:

* Improving speed
	* Client rendering / deferred rendering
	* Client-side caching
	* Delta saving
	* Delta server push over WebSockets
* Supporting better user experiences
	* Modular, non-blocking interface 
	* Intelligent responses to user input	
	* Realtime interactions

This initial MVP includes:

* Sitetree loading / rendering
* Page loading / rendering
* Page saving / publishing
* Work-In-Progress caching and navigation 

There is still plenty of work to do before Origami becomes a stable, cross browser solution. However we have hopefully built it with the capacity to quickly implement missing features.
 
## Installation ##

`cd project_root && git clone https://github.com/silverstripe-supervillains/silverstripe-origami.git ./origami`

### Install ZeroMQ: ###

* `brew install zmq && brew link zmq`
* `brew install autoconf && brew link autoconf`
* `sudo pecl install zmq-beta` (press return to confirm autodetection at the prompt: 'Please provide the prefix of libzmq installation [autodetect] :')

Once ZeroMQ is setup, you can run `composer install` in the site root, then `dev/build flush=1`.
Note: `pecl install zmq-beta` modifies you php.ini file by adding `extension=zmq.so`, you need to restart apache to load this change.

### Install dependancies: ###

* `cd origami && npm install`
* `cd .. && composer install`
* `framework/sake dev/build flush=1`

### SocketServer: ###

Start the sockect server on your command line (then select 'allow incoming connections'):
`php origami/SocketServer.php`

Now you can access the JS admin: http://<your.origami.vhost>/admin/origami/

## Links ##
Repository: https://github.com/silverstripe-supervillains/silverstripe-origami.git 

## License ##

	Copyright (c) 2007-2013, SilverStripe Limited - www.silverstripe.com
	All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	    * Neither the name of SilverStripe nor the names of its contributors may be used to endorse or promote products derived from this software
	      without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
	LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
	GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
	STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
	OF SUCH DAMAGE.
