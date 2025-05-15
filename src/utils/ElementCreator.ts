type ParametersElement = {
  textContent?: string;
  tagName: string;
  classNames: string[];
  callback?: (() => void) | null;
  attribute?: string[];
};

export default class ElementCreator {
  public element: HTMLElement | null | HTMLInputElement | HTMLFormElement = null;

  constructor(parameters: ParametersElement) {
    this.createElement(parameters);
  }

  public getElement(): HTMLElement {
    if (!this.element) {
      throw new Error('Element not created!');
    }
    return this.element;
  }

  public addInnerElement(element: HTMLElement | ElementCreator): void {
    if (this.element) {
      if (element instanceof ElementCreator) {
        this.element.append(element.getElement());
      } else {
        this.element.append(element);
      }
    }
  }

  public removeInnerElement(element: HTMLElement | ElementCreator): void {
    if (this.element) {
      if (element instanceof ElementCreator) {
        this.element.removeChild(element.getElement());
      } else {
        this.element.removeChild(element);
      }
    }
  }

  public createElement(parameters: ParametersElement): void {
    this.element = document.createElement(parameters.tagName);
    if (parameters.textContent !== undefined) {
      this.setTextContent(parameters.textContent);
    }
    if (parameters.callback !== undefined) {
      this.setCallback(parameters.callback);
    }
    if (parameters.attribute !== undefined) {
      this.setAttributes(parameters.attribute);
    }
    this.setCssClasses(parameters.classNames);
  }

  public setCssClasses(cssClasses: string[]): void {
    cssClasses.map((item) => this.element?.classList.add(item));
  }

  public setTextContent(text: string = ''): void {
    if (this.element) {
      this.element.textContent = text;
    }
  }

  public addTextContent(text: string = ''): void {
    if (this.element) {
      this.element.textContent += text;
    }
  }

  public setCallback(callback: ((event: Event) => void) | null): void {
    if (this.element && callback) {
      this.element.addEventListener('click', (event) => callback(event));
    }
  }

  public setAttributes(attributes: string[]): void {
    attributes.forEach((item) => {
      const [name, value] = item.split('=');
      this.element?.setAttribute(name, value);
    });
  }
}
