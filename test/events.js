$(document).ready(function() {
  
  module("Event Building");
  (function() {
    test("Basic event creation with delta", function() {
      
      var obj = { "metadata" : {"name" : "Greek Alphabet" },
        "columns" : [ 
          {"name" : "character", "type" : "string"}, 
          {"name" : "is_modern", "type" : "boolean"}, 
          {"name" : "name", "type" : "string"}, 
          {"name" : "numeric_value", "type" : "number"} 
        ],
        "rows" : [   
          { data : ["α","alpha",true,1] },
          { data : ["ε","epsilon",false,5] }
        ]};

      var ds = new DS({ data : obj, strict : true });

      e = ds._buildEvent("update", { _id : 1, old : { "a" : "b" }, changed : { "a" : "c" }});
      ok(e.name === "update", "event name was set");
      ok(typeof e.delta !== "undefined", "delta was set");
      // TODO uncomment this when we update underscore.js
      // ok(_.deepEqual(e.delta[0],
      //   { _id : 1, old : { "a" : "b" }, changed : { "a" : "c" }}
      // ), "deltas are the same");

    });

    test("Basic event creation with queuing", function() {
      var obj = [
        {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1}, 
        {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
      ];
        
      var ds = new DS({ data : obj }),
          rid = ds._rows[0]._id;

      ds.push();

      ok(ds._queing === true, "queing started");
      ok(ds.get(rid, "character") === "α", "pre set character is correct");
      ok(ds.get(rid, "name") === "alpha", "pre set character is correct");
      ds.set(rid, { "character" : "M", "name" : "Em" });
      ok(ds.get(rid, "character") === "M", "post set character is correct");
      ok(ds.get(rid, "name") === "Em", "post set character is correct");

      ok(ds._deltaQueue.length === 1, "There are deltas in the queue");
      var expectedDelta = {        
        _id : rid,
        old : {
          "character" : "α",
          "name" : "alpha"
        },
        changed : {
          "character" : "M",
          "name" : "Em"
        }
      };
      // TODO: upgrade our underscore.js version, the current one doesn't have deep equal
      // which is needed here.
      // ok(_.deepEqual(ds._deltaQueue[0], expectedDelta), "deltas are equal");

      e = ds._buildEvent("update");
      ok(e.name === "update", "event name was set");
      ok(typeof e.delta !== "undefined", "delta was set");
      // TODO uncomment this when we update underscore.js
      // ok(_.deepEqual(e.delta[0], expectedDelta), "deltas are the same");

      ds.pop();
      ok(ds._queing === false, "no longer queing");
      ok(ds._deltaQueue.length === 0, "no deltas in the queue")
  
    });

    test("Basic event creation with queuing plus delta param", function() {
      var obj = [
        {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1}, 
        {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
      ];
        
      var ds = new DS({ data : obj }),
          rid = ds._rows[0]._id;

      ds.push();

      ok(ds._queing === true, "queing started");
      ok(ds.get(rid, "character") === "α", "pre set character is correct");
      ok(ds.get(rid, "name") === "alpha", "pre set character is correct");
      ds.set(rid, { "character" : "M", "name" : "Em" });
      ok(ds.get(rid, "character") === "M", "post set character is correct");
      ok(ds.get(rid, "name") === "Em", "post set character is correct");

      ok(ds._deltaQueue.length === 1, "There are deltas in the queue");
      var expectedDelta = {        
        _id : rid,
        old : {
          "character" : "α",
          "name" : "alpha"
        },
        changed : {
          "character" : "M",
          "name" : "Em"
        }
      };
      // TODO: upgrade our underscore.js version, the current one doesn't have deep equal
      // which is needed here.
      // ok(_.deepEqual(ds._deltaQueue[0], expectedDelta), "deltas are equal");

      e = ds._buildEvent("update", {_id : 20, old : { "a" : "b" }, changed : { "a" : "c" }});
      ok(e.name === "update", "event name was set");
      ok(typeof e.delta !== "undefined", "delta was set");
      ok(e.delta.length === 2, "there are two deltas");
      ok(e.delta[1]._id === 20, "the last one is the param delta");
      // TODO uncomment this when we update underscore.js
      // ok(_.deepEqual(e.delta[0], expectedDelta), "deltas are the same");

      ds.pop();
      ok(ds._queing === false, "no longer queing");
      ok(ds._deltaQueue.length === 0, "no deltas in the queue")
  
    });
  })();


  module("Events");

  (function() {
    var obj = { "metadata" : {"name" : "Greek Alphabet" },
  "columns" : [ 
    {"name" : "character", "type" : "string"}, 
    {"name" : "is_modern", "type" : "boolean"}, 
    {"name" : "name", "type" : "string"}, 
    {"name" : "numeric_value", "type" : "number"} 
  ],
  "rows" : [   
    { data : ["α","alpha",true,1] },
    { data : ["β","beta",true,2] },
    { data : ["γ","gamma",true,3] },
    { data : ["δ","delta",true,4] },
    { data : ["ε","epsilon",false,5] }]};

    var ds = new DS({ data : obj, strict : true });

    test("basic event binding on entire dataset", function() {
      expect(1);
      ds.bind("sampleevent", null, function() {
        ok(true, "sample event was triggered!");
      });
      ds.trigger("sampleevent");
    });

    test("basic binding on specific row", function() {
      expect(1);
      ds.bind("sampleevent2", {row : ds._rows[0]._id} , function() {
        ok(true, "sampleevent2 triggered with row 1");
      });
      ds.trigger("sampleevent2", { row : ds._rows[0]._id });
    });

    test("basic binding on specific row from array ", function() {
      expect(1);
      ds.bind("sampleevent3", {row : ds._rows[0]._id} , function() {
        ok(true, "sampleevent3 triggered with row 1");
      });
      ds.trigger("sampleevent3", { row : [ds._rows[0]._id, ds._rows[1]._id] });
    });

    test("basic binding on specific row from array reverse", function() {
      expect(1);
      ds.bind("sampleevent4", {row : [ds._rows[0]._id, ds._rows[1]._id]} , function() {
        ok(true, "sampleevent4 triggered with row 1");
      });
      ds.trigger("sampleevent4", { row : ds._rows[0]._id });
    });

    test("multiple subscribers", function() {
      expect(2);
      ds.bind("s1", {row : [ds._rows[0]._id, ds._rows[1]._id]} , function() {
        ok(true, "s1 triggered callback 1");
      });
      ds.bind("s1", {row : [ds._rows[0]._id, ds._rows[1]._id]} , function() {
        ok(true, "s1 triggered callback2");
      });
      ds.trigger("s1", { row : ds._rows[0]._id });
    });

    // TODO: sort out why this is still triggering!
    test("out of range shouldn't trigger", function() {
      expect(0);
      ds.bind("s2", {row : [ds._rows[0]._id, ds._rows[1]._id]} , function() {
        ok(true, "s2 triggered callback 1");
      });
      ds.trigger("s2", { row : ds._rows[2]._id });
    });
  }());

});