import { CardElement, Input, SerializationContext } from 'adaptivecards';

const debug: boolean = false;
const pushButtonSelector = "button.ac-pushButton";
const errorAlertPrefix = 'error-alert';

class RequiredFieldValidator {

    /**
     * Validates input.
     *
     * @param value Value
     * @param errors List of errors
     * @returns Whether input value is valid or not
     */
    public validate(value: string, errors: string[]): boolean {
        debug && console.log(`[validate]`);
        const isValid = !!value;

        if (!isValid) {
            errors.push('A required field cannot be empty');
        }

        return isValid;
    }
}

class AdaptiveCardFieldsValidator {

    /**
     * Handler called on context.onParseElement() to add validators on every field.
     *
     * @param element Card element
     * @param source Source
     * @param context SerializationContext
     * @returns
     */
    public attachFieldValidator(element: CardElement, source: any, context: SerializationContext) {
        debug && console.log('[attachFieldValidator]');

        if (!element.isInteractive) {
            return;
        }

        (element as any).onValueChanged = (input: Input) => this.validateInput(input);

        // Custom validators
        (element as any).validators = [];

        if (source.type === 'Input.Text') {
            (element as any).validators.push(new RequiredFieldValidator());
        }
    }

    /**
     * Validates on whether the survey can be submitted or not.
     *
     * @param inputs List of inputs
     * @returns Response on whether the submit can be submitted
     */
    public canSubmitSurvey(inputs: Input[]): boolean {
        debug && console.log('[onSubmit]');
        const valid = inputs.every((input: Input) => this.validateInput(input));
        return valid;
    }

    /**
     * Enable/disable submit button.
     *
     * @param enable Flag to whether enable/disable submit button
     */
     public enableSubmitButton(enable: boolean) {
        const buttonElement = document.querySelector(pushButtonSelector);

        if (enable) {
            buttonElement?.removeAttribute('disabled');
        } else {
            buttonElement?.setAttribute('disabled', 'true');
        }

        buttonElement?.setAttribute('aria-disabled', enable? 'false': 'true');
    }

    /**
     * Handler to validate input
     *
     * @param input Input
     * @returns Whether input is valid or not
     */
    private validateInput(input: any): boolean {
        debug && console.log(`[validateInput]`);
        debug && console.log(input);

        if (!input.validators.length) {
            input.isValid = () => true;
            return true;
        }

        const errors: any = [];

        if (input.validators.length) {
            input.isValid = () => input.validators.every((validator: any) => validator.validate(input.value, errors));
        }

        if (!input.isValid()) {
            debug && console.log("[validateInput] Invalid!");
            this.enableSubmitButton(false);
            this.renderErrors(input, errors);
            return false;
        } else {
            debug && console.log("[validateInput] Valid!");
            this.enableSubmitButton(true);
            this.removeErrors(input);
            return true;
        }
    }

    private createErrorElement(message: string, id: string) {
        const divElement = document.createElement('div');
        divElement.id = id;
        divElement.innerHTML = `
            <span style="font-size: 16px; color: #a80000">
                &#9888;
            </span>
            <span style="font-size: 12px; color: #a80000">
                ${message}
            </span>
        `;
        return divElement;
    }

    /**
     *  Renders list of errors in the DOM.
     *
     * @param input Input
     * @param errors List of errors to render
     */
    private renderErrors(input: any, errors: string[]) {
        debug && console.log('[renderErrors]');

        // Inject custom HTML elements with error messages
        errors.forEach((error: string) => {
            const elementId = `${errorAlertPrefix}-${input.id}`;
            const errorElement = this.createErrorElement(error, elementId);
            input.renderedElement.parentNode.insertBefore(errorElement, input.renderedElement.nextSibling);
        });
    }

    /**
     *  Remove list of errors from the DOM.
     *
     * @param input Input
     */
    private removeErrors(input: any) {
        const divElement = document.getElementById(`${errorAlertPrefix}-${input.id}`);
        divElement?.remove();
    }
}

export default AdaptiveCardFieldsValidator;