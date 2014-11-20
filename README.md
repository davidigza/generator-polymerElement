generator-polymerElement
========================

a simple yeoman generator for polymer Elements with jade template

Installation 
========================


  npm install generator-polymerelements
  
Usage
========================

  yo polymer elementName
  
this generator create the next structure and add a import link in elements.html:

   -Elements
   |-------elementName-test.jade 
   |-------elementName.json 
   |-------src
   |        |----elementName.jade
   |        |----elementName.sass
   |        |----elementName.js
  -Elements.html  

