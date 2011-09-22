test("WSForm :: constructor", function() {
  var form = $("#myform").WSForm();
  ok( (form != undefined), "OrderForm should validate");
});

test("WSForm :: settings", function() {
  var form = $("#myform").WSForm();

  // Defaults
  ok( (form.settings.formGroupClass == "form-group"), "formGroupClass should default to form-group");
  ok( (form.settings.validationAttribute == "data-validation"), "validationAttribute should default to data-validation");

  form.destroy();

  // Options
  var form2 = $("#myform").WSForm({settings: {formGroupClass: "group"}});
  ok( (form2.settings.formGroupClass != "form-group"), "When options are give, it should overwrite the default");
  ok( (form2.settings.formGroupClass == "group"), "New formGroupClass should be 'group'");
});

test("WSForm :: settings :: elements", function() {

  var form = $("#myform").WSForm();

  // Defaults
  ok( ($("#optional_input").attr("data-validation") === undefined), "option_input should not be required by default");

  form.destroy();

  var form2 = $("#myform").WSForm({
    inputElements: {
      "optional_input": {
        validation: "required"
      }
    }
  });

  ok( ($("#optional_input").attr("data-validation") === "required"), "option_input should required");
});


test("WSForm :: elements", function() {
  var form = $("#myform").WSForm();
  ok( ($.type(form.elements) == "array") , "elements should be an array (" + $.type(form.elements) + ")");
});

test("WSForm :: validate", function() {
  var form = $("#myform").WSForm();
  var result = form.isValid();
  ok( (result === true || result === false) , "should return true or false");
});

test("WSForm :: validate", function() {
  var form = $("#myform").WSForm();
  var result = form.validate();
  ok( (form.elements.length > 0) , "should return true or false");
});

test("WSForm :: override", function() {
  $.extend(WSForm.prototype, {
    validate: function(){
      return "test";
    }
  });
  var form = $("#myform").WSForm();
  ok( (form.validate() == "test") , "should override validate and return 'test'");
});

test("WSElement :: constructor", function() {
  var form = $("#myform").WSForm();
  var element = $("#name").WSElement();
  ok( $.type(element.valid) == "boolean" , "should return true or false");
});

test("WSElement :: override", function() {
  $.extend(WSElement.prototype, {
    errorlist: function(errors, errorlistClass){
      return errorlistClass;
    }
  });
  var form = $("#myform").WSForm();
  var element = $("#name").WSElement();

  ok( element.errorlist([], "test") == "test" , "should return true or false");
});

test("WSElement :: getValue :: text", function() {
  var form = $("#myform").WSForm();
  var element = $("#name").WSElement();
  $("#name").val('test');
  console.log(element.getValue());
  ok( element.getValue() == "test" , "should get the text_field value");
});


test("wsValidator :: addRule & getRule", function() {
  ok( ($.type($.WSValidator.getRule("test")) == "undefined") , "getRule should not return");
  $.WSValidator.addRule("test", function(){});
  ok( ($.type($.WSValidator.getRule("test")) == "function") , "addRule should add a rule option and getRule should return it");
});
