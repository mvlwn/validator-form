test("wsForm:: constructor", function() {
  var form = $("#myform").wsForm();
  ok( (form != undefined), "OrderForm should validate");
});

test("wsForm:: elements", function() {
  var form = $("#myform").wsForm();
  ok( ($.type(form.elements) == "array") , "elements should be an array (" + $.type(form.elements) + ")");
});

test("wsForm:: validate", function() {
  var form = $("#myform").wsForm();
  var result = form.isValid();
  ok( (result === true || result === false) , "should return true or false");
});

test("wsElement:: constructor", function() {
  var element = $("#name").wsElement();
  ok( $.type(element.valid) == "boolean" , "should return true or false");
});

test("wsValidator:: addRule & getRule", function() {
  ok( ($.type($.wsValidator.getRule("test")) == "undefined") , "getRule should not return");
  $.wsValidator.addRule("test", function(){});
  ok( ($.type($.wsValidator.getRule("test")) == "function") , "addRule should add a rule option and getRule should return it");
});

