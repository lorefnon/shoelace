import { html, Shoemaker } from '@shoelace-style/shoemaker';
import styles from 'sass:./form.scss';
import {
  SlButton,
  SlCheckbox,
  SlColorPicker,
  SlInput,
  SlRadio,
  SlRange,
  SlSelect,
  SlSwitch,
  SlTextarea
} from '../../shoelace';

interface FormControl {
  tag: string;
  serialize: (el: HTMLElement, formData: FormData) => void;
  click?: (event: MouseEvent) => any;
  keyDown?: (event: KeyboardEvent) => any;
}

/**
 * @since 2.0
 * @status stable
 *
 * @slot - The form's content.
 *
 * @part base - The component's base wrapper.
 *
 * @emit sl-submit - Emitted when the form is submitted. This event will not be emitted if any form control inside of
 * it is in an invalid state, unless the form has the `novalidate` attribute. Note that there is never a need to prevent
 * this event, since it doen't send a GET or POST request like native forms. To "prevent" submission, use a conditional
 * around the XHR request you use to submit the form's data with. Event details will contain:
 * `{ formData: FormData; formControls: HTMLElement[] }`
 */
export default class SlForm extends Shoemaker {
  static tag = 'sl-form';
  static props = ['novalidate'];
  static styles = styles;

  private form: HTMLElement;
  private formControls: FormControl[];

  /** Prevent the form from validating inputs before submitting. */
  novalidate = false;

  onConnect() {
    this.formControls = [
      {
        tag: 'button',
        serialize: (el: HTMLButtonElement, formData) =>
          el.name && !el.disabled ? formData.append(el.name, el.value) : null,
        click: event => {
          const target = event.target as HTMLButtonElement;
          if (target.type === 'submit') {
            this.submit();
          }
        }
      },
      {
        tag: 'input',
        serialize: (el: HTMLInputElement, formData) => {
          if (!el.name || el.disabled) {
            return;
          }

          if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) {
            return;
          }

          if (el.type === 'file') {
            [...(el.files as FileList)].map(file => formData.append(el.name, file));
            return;
          }

          formData.append(el.name, el.value);
        },
        click: event => {
          const target = event.target as HTMLInputElement;
          if (target.type === 'submit') {
            this.submit();
          }
        },
        keyDown: event => {
          const target = event.target as HTMLInputElement;
          if (
            event.key === 'Enter' &&
            !event.defaultPrevented &&
            !['checkbox', 'file', 'radio'].includes(target.type)
          ) {
            this.submit();
          }
        }
      },
      {
        tag: 'select',
        serialize: (el: HTMLSelectElement, formData) => {
          if (el.name && !el.disabled) {
            if (el.multiple) {
              const selectedOptions = [...el.querySelectorAll('option:checked')];
              if (selectedOptions.length) {
                selectedOptions.map((option: HTMLOptionElement) => formData.append(el.name, option.value));
              } else {
                formData.append(el.name, '');
              }
            } else {
              formData.append(el.name, el.value);
            }
          }
        }
      },
      {
        tag: 'sl-button',
        serialize: (el: SlButton, formData) => (el.name && !el.disabled ? formData.append(el.name, el.value) : null),
        click: event => {
          const target = event.target as SlButton;
          if (target.submit) {
            this.submit();
          }
        }
      },
      {
        tag: 'sl-checkbox',
        serialize: (el: SlCheckbox, formData) =>
          el.name && el.checked && !el.disabled ? formData.append(el.name, el.value) : null
      },
      {
        tag: 'sl-color-picker',
        serialize: (el: SlColorPicker, formData) =>
          el.name && !el.disabled ? formData.append(el.name, el.value) : null
      },
      {
        tag: 'sl-input',
        serialize: (el: SlInput, formData) => (el.name && !el.disabled ? formData.append(el.name, el.value) : null),
        keyDown: event => {
          if (event.key === 'Enter' && !event.defaultPrevented) {
            this.submit();
          }
        }
      },
      {
        tag: 'sl-radio',
        serialize: (el: SlRadio, formData) =>
          el.name && el.checked && !el.disabled ? formData.append(el.name, el.value) : null
      },
      {
        tag: 'sl-range',
        serialize: (el: SlRange, formData) => {
          if (el.name && !el.disabled) {
            formData.append(el.name, el.value + '');
          }
        }
      },
      {
        tag: 'sl-select',
        serialize: (el: SlSelect, formData) => {
          if (el.name && !el.disabled) {
            if (el.multiple) {
              const selectedOptions = [...el.value];
              if (selectedOptions.length) {
                selectedOptions.map(value => formData.append(el.name, value));
              } else {
                formData.append(el.name, '');
              }
            } else {
              formData.append(el.name, el.value + '');
            }
          }
        }
      },
      {
        tag: 'sl-switch',
        serialize: (el: SlSwitch, formData) =>
          el.name && el.checked && !el.disabled ? formData.append(el.name, el.value) : null
      },
      {
        tag: 'sl-textarea',
        serialize: (el: SlTextarea, formData) => (el.name && !el.disabled ? formData.append(el.name, el.value) : null)
      },
      {
        tag: 'textarea',
        serialize: (el: HTMLTextAreaElement, formData) =>
          el.name && !el.disabled ? formData.append(el.name, el.value) : null
      }
    ];

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /** Serializes all form controls elements and returns a `FormData` object. */
  getFormData() {
    const formData = new FormData();
    const formControls = this.getFormControls();

    formControls.map(el => this.serializeElement(el, formData));

    return formData;
  }

  /** Gets all form control elements (native and custom). */
  getFormControls() {
    const slot = this.form.querySelector('slot')!;
    const tags = this.formControls.map(control => control.tag);
    return slot
      .assignedElements({ flatten: true })
      .reduce(
        (all: HTMLElement[], el: HTMLElement) => all.concat(el, [...el.querySelectorAll('*')] as HTMLElement[]),
        []
      )
      .filter((el: HTMLElement) => tags.includes(el.tagName.toLowerCase())) as HTMLElement[];
  }

  /**
   * Submits the form. If all controls are valid, the `sl-submit` event will be emitted and the promise will resolve
   * with `true`. If any form control is invalid, the promise will resolve with `false` and no event will be emitted.
   */
  submit() {
    const formData = this.getFormData();
    const formControls = this.getFormControls();
    const formControlsThatReport = formControls.filter((el: any) => typeof el.reportValidity === 'function') as any;

    if (!this.novalidate) {
      for (const el of formControlsThatReport) {
        const isValid = el.reportValidity();

        if (!isValid) {
          return false;
        }
      }
    }

    this.emit('sl-submit', { detail: { formData, formControls } });

    return true;
  }

  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tag = target.tagName.toLowerCase();

    for (const formControl of this.formControls) {
      if (formControl.tag === tag && formControl.click) {
        formControl.click(event);
      }
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const tag = target.tagName.toLowerCase();

    for (const formControl of this.formControls) {
      if (formControl.tag === tag && formControl.keyDown) {
        formControl.keyDown(event);
      }
    }
  }

  serializeElement(el: HTMLElement, formData: FormData) {
    const tag = el.tagName.toLowerCase();

    for (const formControl of this.formControls) {
      if (formControl.tag === tag) {
        return formControl.serialize(el, formData);
      }
    }

    return null;
  }

  render() {
    return html`
      <div
        ref=${(el: HTMLElement) => (this.form = el)}
        part="base"
        class="form"
        role="form"
        onclick=${this.handleClick.bind(this)}
        onkeydown=${this.handleKeyDown.bind(this)}
      >
        <slot />
      </div>
    `;
  }
}
