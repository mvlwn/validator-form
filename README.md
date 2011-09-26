validator-form -- Flexible jQuery Validation
============================================

## Description

ValidatorForm is inspired by the jQuery Validation Plugin (http://bassistance.de/jquery-plugins/jquery-plugin-validation/)
and the jQuery Validation From Scratch tutorial (http://webcloud.se/log/Form-validation-with-jQuery-from-scratch/)

The goal is to make a lightweight framework for form validation. It should be easy to extend for personal usage.

The script is tested with jQuery 1.6

## Usage

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

### Function-attribute conditions

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

### Built-in rules

* Required: This rule checks if there is a value for a form-element. The validation will only hit on submit.
* Format: Regex check on the value of the form-element. Will use the data-pattern attribute
* Maxlength: Will trigger when length of the value is too long.
* Minlength: Will trigger when the length of the value is too short.