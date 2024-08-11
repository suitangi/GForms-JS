# GoogleForms-JS
JS for data submission to Google Forms.

## Usage

### Setting up Google Forms
1. Create a new [Google Form](https://docs.google.com/forms/u/0/)
2. Add the questions you want, make sure they are `Short Answer` or `Paragraph`
3. Go to Settings > Responses and make sure "Collect email address" and "Allow response editing" are both turned off.
4. Preview your form and run the script to generate the formInput.

### Using GForms.js
1. Download and include gforms.js in your site:
`<script type="text/javascript" src="./gforms.js"></script>`
2. Initialize a `GForm` instance with the input of the form:
```
//This is an example formInput
let myForm = new GForm({
  action: 'https://docs.google.com/forms/u/0/d/e/someFormId/formResponse',
  questions: [
    {
      name: 'Question 1',
      entry: '1234567890'
    }, {
      name: 'Question 2',
      entry: '1234567891'
    },
  ]
});
```
3. Set the answers: (use your own html form/ui)
```
myForm.answers['Question 1'] = 'myAnswer1';
myForm.answers['Question 2'] = 'myAnswer2';
```

4. Submit the form: `myForm.submit();`

## Notes
- This is not a UI library, the point of this project is to provide easy utility to submit to Google forms while letting devs use their own user interface.
- This project does not provide any data validation, and does not support using data validation natively in Google Forms, you'll need to do the data validation before you submit.

## GForm Options and Mehtods
| Option/Method  | Type | Purpose | Usage |
| --- | --- | --- | --- |
| myForm.answers | Object | Maps question names to answer string | `myForm.answers['Question 1'] = 'answer1'`
| myForm.submit()  | Function | Submits the form to Google Forms | `myForm.submit()`
| myForm.destroy() | Function | Destroys the GForm instance and cleans up all form elements | `myForm.destroy()`

2 Parts:
- Google Forms entry names exporter (probably via ajax call to html)
- JS for data submission
