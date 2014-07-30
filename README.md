# dapp [![Build Status](https://travis-ci.org/ibm-js/dapp.png?branch=master)](https://travis-ci.org/ibm-js/dapp)

This project provides an AMD-based Application Framework for building Web & Mobile applications from a JSON
configuration file defining:
  * application controllers
  * application data stores
  * application views including their rendering, logical controller and internationalization file

The views rendering can be based on any JavaScript UI framework including delite/deliteful.

## Status

No official release yet.

## Migration

This is the former [dojox/app project](https://github.com/dmachi/dojox_application).

Migration will require manual steps listed [here](docs/migration.md).

## Issues

Bugs and open issues are tracked in the
[github issues tracker](https://github.com/ibm-js/dapp/issues).

## Licensing

This project is distributed by the Dojo Foundation and licensed under the ["New" BSD License](./LICENSE).
All contributions require a [Dojo Foundation CLA](http://dojofoundation.org/about/claForm).

## Dependencies

This project requires the following other projects to run:
 * delite
 * dcl    (git clone https://github.com/uhop/dcl.git)
 * requirejs (git clone https://github.com/jrburke/requirejs.git)
 * requirejs-dplugins
 * requirejs-domready
 * requirejs-text
 * dojo
 * (optional, only useful to run applications using deliteful) deliteful
 * (optional, only useful to run applications using jquery mobile) jquery mobile

## Installation

_Bower_ release installation:

    $ bower install dapp

_Manual_ master installation: go to the root installation directory and clone dapp from github:

    $ git clone git://github.com/ibm-js/dapp.git

Then install dependencies with bower (or manually from github if you prefer to):

	$ cd dapp
	$ bower install

## Documentation

See the [docs directory](./docs).
