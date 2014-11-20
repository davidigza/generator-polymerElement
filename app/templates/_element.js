Polymer({
  // define element prototype here
  owner: "Daniel",

  ready: function() {
      this.$.el.textContent = this.owner + " is ready!";
  },

  onupdate: function() {
      //... in this Event your polymer must update your data.
  }
});
