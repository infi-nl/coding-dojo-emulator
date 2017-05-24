# Infi Emulator DOJO

Instructions
--
Find the instructions in the index.html page.
In order to run the code, either follow the simple Docker or the No Docker guides below. The Docker setup is nicer as it allows for hot reloading.

Docker
--
Make sure that Docker is installed on your machine and then run ```install-server```, which builds a Docker image that serves the emulator on port ```3000```. When the installer is done, the server can be started by running ```run-server```, which binds the server on host-port ```3000```. When you've opened ```localhost:3000``` in your browser, every change to any HTML or JS-file will result in a browser refresh.

No Docker
--
You can simply run a portable webserver, like this one: http://www.usbwebserver.net/en/download.php.
Everything except downloading romfiles works as well by just opening index.html in Firefox or Safari (Chrome does not work).

Another tested option would be to use this on Windows 10:

- Node (tested with version 6.10.0)
- NPM (tested with version 3.10.10)

Just do...

1. `npm install -g serve`
1. `npm install -g gulp`
1. `npm install` inside the cloned repo folder
1. `gulp watch`

...and your browser should fire up with the dojo running using BrowserSync.