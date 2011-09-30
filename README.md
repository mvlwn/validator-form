validator-form -- Flexible jQuery Validation
============================================

## Description

ValidatorForm is inspired by the jQuery Validation Plugin (http://bassistance.de/jquery-plugins/jquery-plugin-validation/)
and the jQuery Validation From Scratch tutorial (http://webcloud.se/log/Form-validation-with-jQuery-from-scratch/)

The goal is to make a lightweight framework for form validation. It should be easy to extend for personal usage.

The script has been tested with jQuery 1.6 on 

## Basic Usage

### Simple form

```
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required format",
        pattern: "^[a-zA-Z ]{1,30}$"
      }
    }
  });

  <form id="myform" action="#" method="post" onsubmit="return false;">
   	<p>
   		<label for="name">Name</label><br/>
   		<input type="text" value="" name="name" id="name" />
   	</p>
  </form>
```

### Conditional Requirement

The required validation will only be triggered if this checkbox is checked.

```
  $("#myform").validatorForm({
    input: {
      "name": {
        validation: "required",
        required: function(){ $("#check-name").is(":checked"); }
      }
    }
  });

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

```
  $("#myform").validatorForm();

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

The errorlist will be an UL element with all the errors inside LI elements. The default output will look like this:

```
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

```
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


### Built-in rules

* Required: This rule checks if there is a value for a form-element. The validation will only hit on submit.
* Format: Regex check on the value of the form-element. Will use the data-pattern attribute
* Maxlength: Will trigger when length of the value is too long.
* Minlength: Will trigger when the length of the value is too short.