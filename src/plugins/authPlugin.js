import { SwaggerUIPlugin } from "swagger-ui-react";

export class AuthorizationPlugin extends SwaggerUIPlugin {
  constructor(system) {
    super(system);
    this.authorizationInputs = [];
  }

  apply() {
    const { authSelectors } = this.system;

    // Listen for updates to authorization inputs
    authSelectors.getDefinitions().forEach((definition) => {
      authSelectors.getFields(definition.get("name")).forEach((field) => {
        field.subscribe((value) => {
          this.onInputUpdate(definition.get("name"), field.get("key"), value);
        });
      });
    });
  }

  onInputUpdate(name, key, value) {
    // Store the updated input value
    this.authorizationInputs.push({ name, key, value });

    // Trigger any logic or actions based on the updated input
    console.log(`Updated ${name}.${key} value: ${value}`);
  }
}
