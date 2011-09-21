test("Constructor", function() {
  var form = $("#myform");
  ok( form.wsValidate(), "OrderForm should validate");
});

test("Constructor::AddRule", function() {
  var form = $("#myform").wsValidate();
  form.addRule("test", function(){});
  ok( (form.rules["test"] != undefined) , "addRule should add a rule option");
});