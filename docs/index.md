---
layout: doc
---

dapp is a small application framework providing a set of classes to manage the lifecycle and behavior of a single
page application delivered to a mobile or desktop platform.
The main class, Application, is responsible for providing the lifecycle of the application and is designed to be easily
modified with additional custom behaviors.
An application instance contains views which provide the visible user interface.
The available views, module dependencies, and other information about the application are all passed into the
Application class through a JSON configuration file.

## General documentation

* [Introduction to dapp config](config.md)

## Utility modules

* [view](view.md) - view utility functions

## Base classes

* [Controller](Controller.md) - base class for dapp controllers

