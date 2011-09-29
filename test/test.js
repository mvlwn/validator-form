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

test("ValidatorForm :: elements :: focus", function() {
  var form = $("#myform").validatorForm();
  var nameElement = form.element("name");
  var emailElement = form.element("email");

  nameElement.object.focus();
  ok( (form.focusedElement == nameElement)  , "name should be focused");

  emailElement.object.focus();
  ok( (form.focusedElement == emailElement)  , "name should be focused");

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

test("ValidatorForm :: Callbacks :: beforeValidate & afterValidate", function() {
  var form = $("#clean-form").validatorForm({
    input: {
      "name": {
        validation: "required"
      }
    },
    beforeValidate: function(form, event){ form.currentForm.addClass("beforeValidate"); },
    afterValidate: function(form, event){ form.currentForm.addClass("afterValidate"); }
  });

  form.validate();

  ok( form.currentForm.hasClass("beforeValidate") && form.currentForm.hasClass("afterValidate") ,
      "validate should trigger beforeValidate and afterValidate callback");
  
  form.destroy();
});

test("ValidatorForm :: Callbacks :: beforeSubmit & afterSubmitFailed & & afterSubmitSuccess", function() {
  var form = $("#clean-form").validatorForm({
    input: {
      "name": {
        validation: "required"
      }
    },
    beforeSubmit: function(form, event){ form.currentForm.addClass("beforeSubmit"); console.log(event); },
    afterSubmitFailed: function(form, event){ form.currentForm.addClass("afterSubmitFailed"); console.log(event); },
    afterSubmitSuccess: function(form, event){ form.currentForm.addClass("afterSubmitSuccess"); console.log(event); }
  });

  form.currentForm.submit();
  ok( form.currentForm.hasClass("beforeSubmit"), "validate should trigger beforeSubmit");
  ok( form.currentForm.hasClass("afterSubmitFailed"), "validate should trigger afterSubmitFailed");

  form.element("name").object.val("something");
  form.currentForm.submit();
  ok( form.currentForm.hasClass("afterSubmitSuccess"), "validate should trigger afterSubmitSuccess");

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

  $(radioButtons[0]).attr("checked", true);
  ok( element.value() == $(radioButtons[0]).val() , "Radio");

  $(radioButtons[0]).attr("checked", false);
  $(radioButtons[1]).attr("checked", true);
  ok( element.value() == $(radioButtons[1]).val() , "Radio");

  form.destroy();

});


test("ValidatorElement :: Radiobuttons :: Clean", function() {

  var cleanForm = $("#clean-form").validatorForm({
    input: {
      "active": {
        validation: "required"
      }
    }
  });

  var element = cleanForm.element("active");

  $("#clean-form [name=active]").attr("checked", false);
  ok(element.validate() === false, "Radio buttons should not validate without a checked button");

  $("#clean-active_true").attr("checked", 'check`ed');
  $("#clean-active_false").attr("checked", '');
  ok(element.validate() === true, "Radio element should validate with first button checked");

  $("#clean-active_true").attr("checked", '');
  $("#clean-active_false").attr("checked", 'checked');
  ok(element.validate() === true, "Radio element should validate with second button checked");

  $("#clean-active_true").attr("checked", false);
  $("#clean-active_false").attr("checked", false);

  cleanForm.validate();

  ok(!cleanForm.isValid(), "form not valid because no radio button is selected");
  $("#clean-active_true").attr("checked", 'checked');
  
  cleanForm.validate();
  ok(cleanForm.isValid(), "form should be valid");

  $("#clean-active_false").attr("checked", 'checked');
  cleanForm.validate();
  ok(cleanForm.isValid(), "form should still be valid");

  cleanForm.destroy();

});


test("Validator :: addRule & getRule", function() {
  ok( ($.type($.validator.getRule("test")) == "undefined") , "getRule should not return");
  $.validator.addRule("test", function(){});
  ok( ($.type($.validator.getRule("test")) == "function") , "addRule should add a rule option and getRule should return it");
});

test("Validator :: conditions", function() {

  $("#clean-form [name=active]").attr("checked", false);

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

  cleanForm.destroy();
});
