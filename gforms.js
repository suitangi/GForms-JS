class GForm {

  static formParentElement;
  static instances = new Set(); // Track active instances

  constructor(formInput) {
    this.checkInputs(formInput);
    this.name = formInput.name;
    this.answers = {};
    this.formInputElements = {};
    this.isDestroyed = false;
    
    // Add to instances tracker
    GForm.instances.add(this);

    //setup formParent element
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
    
    this.form = document.createElement('form');
    this.form.setAttribute('action', formInput.action);
    this.form.setAttribute('target', `${this.name}-iframe`);
    this.form.setAttribute('method', 'post');
    
    // Add error handling for iframe
    this.iframe.addEventListener('load', this._handleIframeLoad.bind(this));
    this.iframe.addEventListener('error', this._handleIframeError.bind(this));
    
    this.domElement.appendChild(this.iframe);
    this.domElement.appendChild(this.form);

    let tmpinput;
    formInput.questions.forEach((q) => {
      tmpinput = document.createElement('input');
      tmpinput.setAttribute('type', 'hidden');
      
      // Sanitize question name to prevent XSS
      const sanitizedName = this._sanitizeString(q.name);
      
      if (!q.answer) {
        this.answers[sanitizedName] = '';
        tmpinput.setAttribute('value', '');
      } else {
        this.answers[sanitizedName] = q.answer;
        tmpinput.setAttribute('value', q.answer);
      }
      tmpinput.setAttribute('name', `entry.${q.entry}`);
      this.form.appendChild(tmpinput);
      this.formInputElements[sanitizedName] = tmpinput;
    });
    GForm.formParentElement.appendChild(this.domElement);
  }

  setAnswer(questionName, value) {
    if (this.isDestroyed) {
      throw new Error('Cannot set answer on destroyed form');
    }
    const sanitizedName = this._sanitizeString(questionName);
    this.answers[sanitizedName] = String(value);
  }

  destroy() {
    if (this.isDestroyed) return;
    
    // Remove event listeners
    if (this.iframe) {
      this.iframe.removeEventListener('load', this._handleIframeLoad);
      this.iframe.removeEventListener('error', this._handleIframeError);
    }
    
    // Clear DOM
    if (this.domElement && this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }
    
    // Clear references
    this.domElement = null;
    this.iframe = null;
    this.form = null;
    this.formInputElements = {};
    this.answers = {};
    this.isDestroyed = true;
    
    // Remove from instances tracker
    GForm.instances.delete(this);
    
    // Clean up parent if no instances remain
    if (GForm.instances.size === 0 && GForm.formParentElement) {
      GForm.formParentElement.remove();
      GForm.formParentElement = null;
    }
  }

  submit(onSuccess, onError) {
    if (this.isDestroyed) {
      throw new Error('Cannot submit destroyed form');
    }
    
    // Store callbacks
    this._onSuccess = onSuccess;
    this._onError = onError;
    
    // Update form values
    Object.keys(this.answers).forEach((q) => {
      if (this.formInputElements[q]) {
        this.formInputElements[q].value = this.answers[q];
      }
    });
    
    // Set timeout for submission tracking
    this._submissionTimeout = setTimeout(() => {
      if (this._onError) {
        this._onError(new Error('Submission timeout'));
      }
    }, 10000); // 10 second timeout
    
    this.form.submit();
  }

  _handleIframeLoad() {
    // Clear timeout
    if (this._submissionTimeout) {
      clearTimeout(this._submissionTimeout);
      this._submissionTimeout = null;
    }
    
    // Check for Google Forms error responses
    try {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      const bodyText = iframeDoc.body ? iframeDoc.body.textContent || iframeDoc.body.innerText : '';
      const title = iframeDoc.title || '';
      
      // Check for various error indicators
      if (title.includes('Error') || 
          bodyText.includes('400') || 
          bodyText.includes('Bad Request') ||
          bodyText.includes('invalid') ||
          bodyText.includes('error') ||
          url.includes('formRestricted') ||
          bodyText.includes('This form is no longer accepting responses')) {
        
        let errorMessage = 'Form submission failed';
        if (bodyText.includes('400') || bodyText.includes('Bad Request')) {
          errorMessage = 'Bad Request (400): Invalid form data. Check that multiple choice answers exactly match the available options.';
        } else if (bodyText.includes('This form is no longer accepting responses')) {
          errorMessage = 'Form is no longer accepting responses.';
        } else if (bodyText.includes('invalid')) {
          errorMessage = 'Invalid form data submitted.';
        }
        
        if (this._onError) {
          this._onError(new Error(errorMessage));
        }
        return;
      }
    } catch (e) {
      // Cross-origin restrictions - can't read iframe content
      // This is expected for successful submissions
    }
    
    // If we get here, assume success
    if (this._onSuccess) {
      this._onSuccess();
    }
  }

  _handleIframeError() {
    // Clear timeout
    if (this._submissionTimeout) {
      clearTimeout(this._submissionTimeout);
      this._submissionTimeout = null;
    }
    
    if (this._onError) {
      this._onError(new Error('Form submission failed'));
    }
  }

  _sanitizeString(str) {
    // Basic sanitization to prevent XSS
    return String(str).replace(/<script[^>]*>.*?<\/script>/gi, '')
                     .replace(/<[\/\!]*?[^<>]*?>/gi, '')
                     .replace(/<[^>]*?script.*?>/gi, '');
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
    
    // Validate Google Forms URL
    if (!this._isValidGoogleFormsUrl(input.action)) {
      throw new Error('Invalid Google Forms action URL. Must be a legitimate Google Forms endpoint.');
    }
  }

  _isValidGoogleFormsUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'docs.google.com' && 
             urlObj.pathname.includes('/forms/') &&
             urlObj.pathname.includes('/formResponse');
    } catch (e) {
      return false;
    }
  }

  static setId(el, id) {
    let attempts = 0;
    let uniqueId = id;
    
    // Use more robust ID generation
    while (document.getElementById(uniqueId) !== null && attempts < 100) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        uniqueId = id + '-' + crypto.randomUUID().substring(0, 8);
      } else {
        uniqueId = id + '-' + Math.random().toString(36).substring(2, 10);
      }
      attempts++;
    }
    
    if (attempts >= 100) {
      throw new Error('Unable to generate unique ID');
    }
    
    el.setAttribute('id', uniqueId);
    return uniqueId;
  }

  static quickSubmit(input, onSuccess, onError) {
    let form = new GForm(input);
    form.submit(
      () => {
        if (onSuccess) onSuccess();
        // Cleanup after delay
        setTimeout(() => {
          form.destroy();
        }, 2000);
      },
      (error) => {
        if (onError) onError(error);
        // Cleanup after delay
        setTimeout(() => {
          form.destroy();
        }, 2000);
      }
    );
    return form; // Return form instance for manual control if needed
  }
  
  // Utility method to validate form data
  static validateFormData(formInput) {
    try {
      const tempForm = new GForm(formInput);
      tempForm.destroy();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}