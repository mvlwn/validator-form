test("Constructor", function() {
  var validator = $("#myform").wsValidator();
  console.log(validator);
  ok( validator, "OrderForm should validate");
});

// test("Constructor::AddRule", function() {
//   var validator = $("#myform").wsValidate();
//   validator.addRule("test", function(){});
//   ok( (validator.rules["test"] != undefined) , "addRule should add a rule option");
// });
// 
// test("Constructor::Elements", function() {
//   var validator = $("#myform").wsValidate();
//   ok( ($.type(validator.elements) == "array") , "elements should be an array (" + $.type(validator.elements) + ")");
// });
// 
// 
// test("Attributes", function(){
//   var name = $("#myform [name=name]");
//   ok( name.attr("data-validate").length > 0, "data-validate must be present");
// });