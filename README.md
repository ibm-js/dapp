# dapp [![Build Status](https://travis-ci.org/ibm-dojo/dapp.png?branch=master)](https://travis-ci.org/ibm-dojo/dapp)

This project provides an AMD-based Application Framework for building Web & Mobile applications from a JSON
configuration file defining:
  * application controllers
  * application data stores
  * application views including their rendering, logical controller and internationalization file

The views rendering can be based on any JavaScript UI framework including Dojo Mobile.

## Status

No official release yet.

## Migration

This is the former dojox/app project.

Migration steps from dojox/app to dapp:

* replace any use of "dojox/app/module" AMD module path by "dapp/modules"
* replace any use of "dojox/app" AMD module path by "dapp"

## Licensing

This project is distributed by the Dojo Foundation and licensed under the ["New" BSD License](./LICENSE).
All contributions require a [Dojo Foundation CLA](http://dojofoundation.org/about/claForm).

## Dependencies

This project requires the following other projects to run:
 * dojo
 * dijit
 * dojox/css3
 * (optional, only useful to run the tests) dojox/mobile

## Installation

* Manual installation of by dropping dapp as a sibling of the top level Dojo modules:
 * dojo
 * dijit
 * dapp

 To install the latest master, go to the root Dojo installation directory and clone dapp from github

 git clone git://github.com/ibm-dojo/dapp.git

## Documentation

http://livedocs.dojotoolkit.org/dojox/app

## Credits

* Ed Chatelain (IBM CCLA)
* Dustin Machi (CLA)
* Christophe Jolif (IBM CCLA)
* Stephen Zhang (IBM CCLA)
* Eric Wang (IBM CCLA)
