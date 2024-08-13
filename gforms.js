class GForm {

  static formParentElement;

  constructor(formInput) {
    this.checkInputs(formInput);
    this.name = formInput.name;
    this.answers = {};
    this.formInputElements = {};

    //setup formParent elemnt
    if (!GForm.formParentElement) {
      GForm.formParentElement = document.createElement('div');
      GForm.formParentElement.setAttribute('hidden', true);
      GForm.setId(GForm.formParentElement, 'GFormsParentDiv');
      document.body.appendChild(GForm.formParentElement);
    }

    //create dummyIframe and form elements
    this.domElement = document.createElement('div');
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('name', `${this.name}-iframe`)
    this.iframe.style = "display:none;";
    // GForm.setId(this.iframe, `${this.name}-iframe`);
    this.form = document.createElement('form');
    // GForm.setId(this.form, `${this.name}-form`);
    this.form.setAttribute('action', formInput.action);
    this.form.setAttribute('target', `${this.name}-iframe`);
    this.form.setAttribute('method', 'post');
    this.domElement.appendChild(this.iframe);
    this.domElement.appendChild(this.form);

    let tmpinput;
    formInput.questions.forEach((q) => {
      tmpinput = document.createElement('input');
      tmpinput.setAttribute('type', 'hidden');
      if (!q.answer) {
        this.answers[q.name] = '';
        tmpinput.setAttribute('value', '');
      } else {
        this.answers[q.name] = q.answer;
        tmpinput.setAttribute('value', q.answer);
      }
      tmpinput.setAttribute('name', `entry.${q.entry}`);
      this.form.appendChild(tmpinput);
      this.formInputElements[q.name] = tmpinput;
    });
    GForm.formParentElement.appendChild(this.domElement);
  }

  setAnswer(questionName, value) {
    this.answers[questionName] = value + '';
  }

  destroy() {
    this.domElement.innerHTML = '';
    GForm.formParentElement.removeChild(this.domElement);
  }

  submit() {
    Object.keys(this.answers).forEach((q) => {
      this.formInputElements[q].value = this.answers[q];
    })
    this.form.submit();
  }

  checkInputs(input) {
    let expectedOptions = ['name', 'action', 'questions'];
    expectedOptions.forEach((o) => {
      if (input[o] === undefined) {
        throw new Error(`${o} attribute not found in formInput.`)
      }
    });
    if (input.questions.length === 0) {
      throw new Error(`${input.name} form has no questions.`)
    }
  }

  static setId(el, id) {
    while (document.getElementById(id) !== null) {
      id += Math.random().toString(36).slice(9);
    }
    el.setAttribute('id', id);
  }

  static quickSubmit(input) {
    let form = new GForm(input);
    form.submit();
    setTimeout((form) => {
      form.destroy();
    }, 2000, form);
  }
}
