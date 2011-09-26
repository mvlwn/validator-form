test("ValidatorForm :: constructor", function() {
  var form = $("#myform").validatorForm();
  ok( (form != undefined), "OrderForm should validate");
  form.destroy();
});

test("ValidatorForm :: settings", function() {
  var form = $("#myform").validatorForm();

  // Defaults
  ok( (form.settings.formGroupClass == "form-group"), "formGroupClass should default to form-group");
  ok( (form.settings.validationAttribute == "data-validation"), "validationAttribute should default to data-validation");

  form.destroy();

  // Options
  var form2 = $("#myform").validatorForm({formGroupClass: "group"});
//  console.log($(form2.settings));
  ok( (form2.settings.formGroupClass != "form-group"), "When options are give, it should overwrite the default");
  ok( (form2.settings.formGroupClass == "group"), "New formGroupClass should be 'group'");

  form2.destroy();
});

test("ValidatorForm :: settings :: elements", function() {

  var form = $("#myform").validatorForm();

  // Defaults
  ok( ($("#optional_input").attr("data-validation") === undefined), "option_input should not be required by default");

  form.destroy();

  var form2 = $("#myform").validatorForm({
    input: {
      "optional_input": {
        validation: "required"
      }
    }
  });

  ok( ($("#optional_input").attr("data-validation") === "required"), "option_input should be required");

  form.destroy();
});

test("ValidatorForm :: elements", function() {
  var form = $("#myform").validatorForm();
  ok( ($.type(form.elements) == "array") , "elements should be an array (" + $.type(form.elements) + ")");
  form.destroy();
});

test("ValidatorForm :: elements :: finding elements", function() {
  var form = $("#myform").validatorForm();
  var element = form.element($("#name"));
  ok( (element.object[0] == $("#name")[0]) , "findElement should return the element");
  form.destroy();
});

test("ValidatorForm :: validate", function() {
  var form = $("#myform").validatorForm();
  var result = form.isValid();
  ok( (result === true || result === false) , "should return true or false");
  form.destroy();
});

test("ValidatorForm :: validate", function() {
  var form = $("#myform").validatorForm();
  var result = form.validate();
  ok( (form.elements.length > 0) , "should return true or false");
  form.destroy();
});

test("ValidatorElement :: constructor", function() {
  var form = $("#myform").validatorForm();
  var element = form.element($("#name"));
  ok( $.type(element.valid) == "boolean" , "should return true or false");
  form.destroy();
});

test("ValidatorElement :: override", function() {
  var form = $("#myform").validatorForm({
    errorlist: function(){ return "test" }
  });

  var element = form.element($("#name"));

  ok( element.form == form , "element form should be the same as form");
  ok( form.errorlist(element) == "test" , "should override the method errorlist by options");

  form.destroy();

  var form2 = $("#myform").validatorForm({});
  ok( form2.errorlist(element) != "test" , "should override the method errorlist by options");

  form2.destroy();
});

test("ValidatorElement :: override", function() {
  var form = $("#myform").validatorForm();
  var element = form.element($("#name"));
  ok( form.errorlist(element) != "test" , "should override the method errorlist by prototype");
  form.destroy();
});

test("ValidatorElement :: getValue :: text", function() {
  var form = $("#myform").validatorForm();
  var element = form.element($("#name"));
  $("#name").val('test');
  ok( element.value() == "test" , "should get the text_field value. " + $("#name").val() + " : " + element.value());
  form.destroy();
});

test("ValidatorElement :: Radiobuttons", function() {
  var form = $("#myform").validatorForm();
  var radioButtons = $("#myform [name=active]");
  var element = form.element($("#active_true"));

  $(radioButtons).attr("checked", false);
  ok( element.value() == undefined , "Radio");

  $(radioButtons[0]).attr("checked", 'checked');
  ok( element.value() == $(radioButtons[0]).val() , "Radio");

  $(radioButtons[1]).attr("checked", 'checked');
  ok( element.value() == $(radioButtons[1]).val() , "Radio");

  form.destroy();
});

test("Validator :: addRule & getRule", function() {
  ok( ($.type($.validator.getRule("test")) == "undefined") , "getRule should not return");
  $.validator.addRule("test", function(){});
  ok( ($.type($.validator.getRule("test")) == "function") , "addRule should add a rule option and getRule should return it");
});

test("Validator :: conditions", function() {
  var cleanForm = $("#clean-form").validatorForm({
    input: {
      "email": {
        validation: "required",
        required: function(){
          return $("#check-email").is(":checked");
        }
      }
    }
  });

  cleanForm.validate();
  ok( cleanForm.isValid() , "form should be valid");

  $("input#check-email").attr("checked", "checked");
  cleanForm.validate();
  ok( !cleanForm.isValid(), "form should not be valid");

});
