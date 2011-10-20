validator-form -- Flexible jQuery Validation
============================================

## Description

ValidatorForm is inspired by the jQuery Validation Plugin (http://bassistance.de/jquery-plugins/jquery-plugin-validation/)
and the jQuery Validation From Scratch tutorial (http://webcloud.se/log/Form-validation-with-jQuery-from-scratch/)

The goal is to make a lightweight framework for form validation. It should be easy to extend for personal usage.

The script has been tested with jQuery 1.6 on IE8, Firefox 6,7, Safari 5 and Chrome 14

## Basic Usage

### Simple form

```javascript
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required format",
        pattern: "^[a-zA-Z ]{1,30}$"
      }
    }
  });
```
```html
  <form id="myform" action="#" method="post" onsubmit="return false;">
   	<p>
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name" />
   	</p>
  </form>
```

## Advanced Usage

### Custom Rules

```javascript

  $.validator.addRule("my_custom_rule", function(element, event){
    var valid = false;
    // Do stuff to test the result
    return valid;
  });

  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "my_custom_rule"
      }
    }
  });

```

### Conditional Requirement

The required validation will only be triggered if this checkbox is checked.

```javascript
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required",
        required: function(){ $("#check-name").is(":checked"); }
      }
    }
  });
```
```html
  <form id="myform" action="#" method="post" onsubmit="return false;">
    <p>
   		<label for="check-name">Check name</label><br/>
   		<input type="text" value="1" name="check-name" id="check-name" />
   	</p>
   	<p>
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name" />
   	</p>
  </form>
```

### HTML-attribute conditions

```javascript
  $("#myform").validatorForm();
```
```html
  <form id="myform" action="#" method="post" onsubmit="return false;">
   	<p>
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name"
   		  data-validation="required format" data-pattern="^[a-zA-Z ]{1,30}$" />
   	</p>
  </form>
```

## Errorlists

### Default errorlist

By default the errorlist will be a list. The output will look like this:

```html
  <form id="myform" action="#" method="post" onsubmit="return false;">
   	<p class="error">
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name" class="error" />
   		<ul class="errorlist">
   		  <li>This field is required</li>
   		  <li>The format of this field is incorrect</li>
   		</ul>
   	</p>
  </form>
```

### Custom errorlist

Return an alertbox and give the object an highlight the field with the error classname

```javascript
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required"
      }
    },
    displayErrorlist: fuction(element, errors){
      var errorClass = element.form.settings.errorClass;
      element.object.addClass(errorClass);

      var label = element.container.find("[for=" + element.object.id + "]);
      var txt = "The field " + label.text() + " contains errors:\n";
      $.each(errors, function(i, error){
        txt += "- " + error + "\n";
      })
      alert(txt);
    }
  });

```

## Handlers

There are 2 types of handlers available. 1 custom handlers for the validatorForm and standard jquery events on the elements.

### ValidatorForm handlers

The handlers will be called when the form does certain events. The following list of handlers are available:

 * beforeValidate
 * afterValidate
 * beforeSubmit
 * afterSubmitFailed
 * afterSubmitSuccess

The handler-function should look something like this:

```javascript
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required"
      }
    },
    beforeSubmit: beforeSubmitHandler,
    afterSubmitFailed: afterSubmitFailedHandler
  });


  // disable all fields
  function beforeSubmitHandler(form, event){
    $.each(form.elements, function(i, element)){
      element.object.attr("disabled", "disabled");
    }
  }

  // enable all fields on failure
  function afterSubmitFailedHandler(form, event){
    $.each(form.elements, function(i, element)){
      element.object.attr("disabled", "");
    }
  }

```

### ValidatorElement handlers

The handlers will be called when the validate method is called on the element.

 * beforeValidate
 * afterValidate

The handler-function should look something like this:

```javascript
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required",
        beforeValidate: function(){
          // Do stuff here
        },
        afterValidate: function(){
          // Do other stuff here
        }
      }
    }
  });

```

### Custom ValidatorElement handlers

You can make handlers of your own in your rules.


```javascript

  $.validator.addRule("my_custom_rule", function(element, event){
    element.callHandler("beforeMyCustomRule");
    var valid = false;

    // Do stuff to test the result
    return valid;
  });

  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "my_custom_rule",
        beforeMyCustomRule: function(){
          var element = this;
          // Do something
        }
      }
    }
  });

```

### jQuery events on Validator elements

All jQuery events can be used. While creating the element, the jQuery object will bind this event.
Full list of events can be found here: http://api.jquery.com/category/events/

```javascript
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required"
      }
    },
    events: {
      "focusin": function(){ $(this).effect("highlight", {}, 2000)};
    }
  }
```


### Built-in rules

* Required: This rule checks if there is a value for a form-element. The validation will only hit on submit.
* Format: Regex check on the value of the form-element. Will use the data-pattern attribute
* Maxlength: Will trigger when length of the value is too long.
* Minlength: Will trigger when the length of the value is too short.