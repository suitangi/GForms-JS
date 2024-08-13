# GoogleForms-JS
JS for data submission to Google Forms.

## Usage

### Setting up Google Forms
1. Create a new [Google Form](https://docs.google.com/forms/u/0/)
2. Add the questions you want, make sure they are `Short Answer` or `Paragraph`
3. Go to Settings > Responses and make sure "Collect email address" and "Allow response editing" are both turned off.
4. Go to Settings > Presentations and make sure "Disable autosave for all respondents" is turned on.
5. Preview your form and run the script to generate the formInput.

### Using GForms.js

#### Option 1: Initialize a GForm Instance
1. Download and include gforms.js:\
`<script type="text/javascript" src="./gforms.js"></script>`
2. Initialize a `GForm` instance with the input of the form:
```
//This is an example formInput
let myForm = new GForm({
  name: 'myGForm',
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
myForm.setAnswer('Question 1', 'myAnswer1');
myForm.setAnswer('Question 2', 'myAnswer2');
```

4. Submit the form: `myForm.submit();`

#### Option 2: Quick Submit
1. Download and include gforms.js:\
`<script type="text/javascript" src="./gforms.js"></script>`
2. Use the `GForm.quickSubmit()` function:
```
GForm.quickSubmit({
  name: 'myGForm',
  action: 'https://docs.google.com/forms/u/0/d/e/someFormId/formResponse',
  questions: [
    {
      name: 'Question 1',
      entry: '1234567890',
      answer: 'Answer1'
    }, {
      name: 'Question 2',
      entry: '1234567891',
      answer: 'Answer2'
    },
  ]
});
```

## Notes
- This is not a UI library, the point of this project is to provide easy utility to submit to Google forms while letting devs use their own user interface.
- This project does not provide any data validation, and does not support using data validation natively in Google Forms, you'll need to validate your users' inputs and give feedback separately.


## Options and Methods
#### GForm Instance
| Methods  | Type | Purpose |
| --- | --- | --- |
| `myForm.setAnswer(questionName: string, answer: string)` | Function | Maps question names to answer string |
| `myForm.submit()`  | Function | Submits the form to Google Forms |
| `myForm.destroy()` | Function | Destroys the GForm instance and cleans up all form elements

#### formInput
| Option | Required? | Type | Purpose |
| --- | --- | --- | --- |
| name | ✔ | string | The name of the form |
| action | ✔ | string | The action URL for the form |
| questions | ✔ | list of `questions` | List of questions |

#### questions
| Option | Required? | Type | Purpose |
| --- | --- | --- | --- |
| name | ✔ | string | The name of the question |
| entry | ✔ | string | The form entry ID to the question |
| answer | ✗ | list | Default answer to the question |

Example:
```
{
  name: 'myForm'
  action: 'https://docs.google.com/forms/u/0/d/e/someFormId/formResponse',
  questions: [
    {
      name: 'Question 1',
      entry: '1234567890'
    }, {
      name: 'Question 2',
      entry: '1234567891',
      answer: 'My answer 2'
    },
  ]
}
```
