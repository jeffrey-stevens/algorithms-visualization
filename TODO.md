# Todo

* Don't hard-code random array range
  * Set range to 0 - 1
  * Use D3's scaleLinear() function instead
* Remove hard-coded dimensions
* The color transitions should be faster...
* Change snake case variables and functions to camel case
* Need to clarify the conceptual model of array indexing

## Issues

* Make sure arrays of length 0 or 1 are handled correctly

## Refactoring

* The array should be a member of the *Viz classes
  * Need to rethink the architecture of the program
* Move all awaits statements inside the step visualization methods
* Clean up functions in Mergesort

## Improvements

* In Mergesort, have underline bars show full split groupings
  * I.e. Show the inactive half in gray and the active half in black
* Add grouping bars to Quicksort

## Features

* Include descriptions of each step


## Algorithms

* Radix sort
* Tower of Hanoi