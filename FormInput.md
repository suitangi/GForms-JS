# Extracting FormInput Data from Google Forms

This document explains the **easiest way** to extract the formInput data required for GForms.js from your Google Forms using Google's official prefilled links feature.

## Method: Prefilled Link
Uses Google Forms' official feature to get all entry IDs directly from the URL.

### Step-by-Step Instructions

1. **Create your Google Form** with all the questions you need
2. **Get a prefilled link**:
   - In your form editor, click the **3-dots menu** (⋮)
   - Select **"Get pre-filled link"**
   - **Fill out the form** with any dummy answers
   - Click **"Get link"**
   - **Copy the generated URL**

3. **Extract the formInput**:
   - Go to the **[Testing Interface](index.html)**
   - Paste your prefilled link in the **"Prefilled Link Generator"** section
   - Click **"Generate FormInput"**
   - Copy the generated formInput object!

### Example Prefilled Link

```
https://docs.google.com/forms/d/e/1FAIpQLSe.../viewform?usp=pp_url&entry.1301830845=Answer1&entry.369586431=Answer2&entry.1546868024=Option+1
```

The entry IDs (`entry.1301830845`, `entry.369586431`, etc.) are automatically extracted and used to create your formInput object.

### Generated FormInput Structure

```javascript
{
  "name": "extractedForm",
  "action": "https://docs.google.com/forms/u/0/d/e/1FAIpQLSe.../formResponse",
  "questions": [
    {
      "name": "Question 1", 
      "entry": "1301830845"
    },
    {
      "name": "Question 2",
      "entry": "369586431" 
    },
    {
      "name": "Question 3",
      "entry": "1546868024"
    }
  ]
}
```


## Troubleshooting

### If the link doesn't work
1. **Make sure you filled out the form completely** when generating the prefilled link
2. **Check that all questions are answered** - empty questions won't appear in the URL
3. **Try generating a new prefilled link** if the first one seems incomplete

### If some questions are missing
- **Go back and answer ALL questions** when creating the prefilled link
- **Multi-choice questions**: Select at least one option
- **Text questions**: Enter any dummy text

### Question Names

The generated formInput uses generic question names like "Question 1", "Question 2", etc. This is perfectly fine since:
- **Entry IDs are what matter** for form submission
- **Question names are just labels** for your code
- **You can rename them** in the generated formInput if needed

## Testing Your FormInput

Once you have your formInput:

1. **Use our [Testing Interface](index.html)** to test form submission
2. **Paste your formInput** into the JSON input area
3. **Fill out the generated test form** 
4. **Click "Test Submission"** to verify it works with Google Forms
5. **Check Google Forms responses** to confirm data was received