document.addEventListener("DOMContentLoaded", async () => {
    const formContainer = document.getElementById("form-container");
    const form = document.getElementById("user-form");
    const statusMessage = document.getElementById("status-message");


    async function fetchQuestions() {
        try {
            const response = await fetch("https://asmple.free.beeceptor.com/questions");
            if (!response.ok) {
                throw new Error(`Failed to fetch questions: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching questions:", error);
            statusMessage.textContent = "Error loading form questions.";
            statusMessage.style.color = "red";
            return []; 
        }
    }

    async function renderForm() {
        const questions = await fetchQuestions();
        formContainer.innerHTML = ""; 

        questions.forEach(question => {
            const wrapper = document.createElement("div");
            if (question.type === "radio") {
                createRadioGroup(wrapper, question);
            } else {
                createInputField(wrapper, question);
            }
            formContainer.appendChild(wrapper);
        });

    }

    function createRadioGroup(container, question) {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = question.legend;
        fieldset.appendChild(legend);

        question.options.forEach(option => {
            const input = document.createElement("input");
            const label = document.createElement("label");
            input.type = "radio";
            input.name = question.name;
            input.value = option.value;
            input.id = option.id;
            input.required = question.required;

            label.setAttribute("for", option.id);
            label.textContent = option.label;

            fieldset.appendChild(input);
            fieldset.appendChild(label);
        });
        container.appendChild(fieldset);
    }

    function createInputField(container, question) {
        const label = document.createElement("label");
        label.textContent = question.label;
        label.setAttribute("for", question.id);

        const input = document.createElement("input");
        input.type = question.type;
        input.id = question.id;
        input.name = question.name;
        input.required = question.required;

        if (question.pattern) {
            input.pattern = question.pattern;
        }
        input.addEventListener("input", (event) => {
            console.log("Input event triggered");
            if (question.required) {
                if(input.validity.valueMissing)
              input.setCustomValidity(`Please enter ${question.label}.`);
                else {
                    input.setCustomValidity("");
                  }
            } else if (question.pattern ) {
                if(input.validity.patternMismatch)
              input.setCustomValidity(`Invalid ${question.label}.`);
                else {
                    input.setCustomValidity("");
                  }
              
            } else if (question.type === "email" ) {
                if(input.validity.typeMismatch)
              input.setCustomValidity("I am expecting an email address!");
                else {
                    input.setCustomValidity("");
                  }
            }
          });
          input.addEventListener("invalid", (event) => {
            event.preventDefault();
            const error_message = input.validationMessage;
            // Display the error message in a way that is accessible to screen readers
            const error_element = document.createElement("div");
            error_element.textContent = error_message;
            error_element.setAttribute("role", "alert");
            error_element.setAttribute("aria-live", "assertive");
            input.parentNode.appendChild(error_element);
          });

        input.addEventListener("blur", () => validateInput(input));
        container.appendChild(label);
        container.appendChild(input);
    }

    function validateInput(input) {
        if (!input.checkValidity()) {
            input.classList.add("error");
            statusMessage.textContent = input.validationMessage;
            statusMessage.style.color = "red";
        } else {
            input.classList.remove("error");
            statusMessage.textContent = "";
        }
    }

    async function submitForm(event) {
        event.preventDefault();
        let isValid = Array.from(form.elements).every(input => validateInput(input) || input.checkValidity());

        if (!isValid) {
            statusMessage.textContent = "Please correct the errors before submitting.";
            statusMessage.style.color = "red";
            return;
        }

        const formData = new FormData(form);
        const jsonData = JSON.stringify(Object.fromEntries(formData.entries()));

        try {
            const response = await fetch("https://asmple.free.beeceptor.com/submitform", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: jsonData
            });

            if (!response.ok) {
                throw new Error(`Submission failed: ${response.status}`);
            }

            statusMessage.textContent = "Form submitted successfully!";
            statusMessage.style.color = "green";
            form.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            statusMessage.textContent = "Failed to submit form. Please try again.";
            statusMessage.style.color = "red";
        }
    }

    form.addEventListener("submit", submitForm);
    renderForm();
});
