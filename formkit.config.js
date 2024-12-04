import { generateClasses } from "@formkit/themes";
import defaultTheme from "@/assets/js/formkit-theme.js";
import customInput from "@/assets/js/formkit-custom.js";

// ----------------- Addons --------------------------- //

// https://formkit.com/plugins/auto-animate
import { createAutoAnimatePlugin } from "@formkit/addons";

// https://formkit.com/plugins/floating-labels
import { createFloatingLabelsPlugin } from "@formkit/addons";
import "@formkit/addons/css/floatingLabels";

// https://formkit.com/plugins/multi-step
import { createMultiStepPlugin } from "@formkit/addons";
import "@formkit/addons/css/multistep";

// https://formkit.com/plugins/auto-height-textarea
import { createAutoHeightTextareaPlugin } from "@formkit/addons";

// https://formkit.com/plugins/local-storage
import { createLocalStoragePlugin } from "@formkit/addons";

const legends = ["checkbox_multi", "radio_multi", "repeater", "transferlist"];

function addAsteriskPlugin(node) {
  if (
    ["button", "submit", "hidden", "group", "list", "meta"].includes(
      node.props.type
    )
  )
    return;

  const isRequired = node.props?.validation?.includes("required");

  if (isRequired) {
    // const originalLabel = node.props.label;
    // node.props.label = originalLabel ? `${originalLabel} *` : "*";

    node.on("created", () => {
      if (node.props.definition.schemaMemoKey) {
        node.props.definition.schemaMemoKey += "_required";
      }

      const originalSchemaFn = node.props.definition.schema;
      node.props.definition.schema = (sectionsSchema = {}) => {
        // Modify the label section to include data-required and required span
        if (!sectionsSchema.label) {
          sectionsSchema.label = {};
        }
        if (!sectionsSchema.label.attrs) {
          sectionsSchema.label.attrs = {};
        }
        sectionsSchema.label.attrs["data-required"] = true;

        // Add children array for label if it doesn't exist
        sectionsSchema.label.children = [
          "$label",
          {
            $el: "span",
            attrs: {
              class: "formkit-asterisk",
            },
            children: ["*"],
          },
        ];

        const schema = originalSchemaFn(sectionsSchema);

        // Also ensure the outer wrapper has data-required
        if (!schema.attrs) schema.attrs = {};
        schema.attrs["data-required"] = true;

        return schema;
      };
    });
  }
}

export default {
  plugins: [
    addAsteriskPlugin,
    createFloatingLabelsPlugin({
      useAsDefault: false, // defaults to false
    }),
    createAutoAnimatePlugin({
      // optional config
    }),
    createMultiStepPlugin(),
    createAutoHeightTextareaPlugin(),
    createLocalStoragePlugin({
      // plugin defaults:
      prefix: "formkit",
      key: undefined,
      control: undefined,
      maxAge: 3600000, // 1 hour
      debounce: 200,
      beforeSave: undefined,
      beforeLoad: undefined,
    }),
  ],
  config: {
    classes: generateClasses(defaultTheme),
  },
  inputs: customInput,
};
