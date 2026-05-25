import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext, useFormContext } from "./form-context.tsx";
import TextField from "../inputs/text-fields.tsx";
import NumberField from "../inputs/number-fields.tsx";
import DateField from "../inputs/date-fields.tsx";
import { Button } from "antd";
import SelectFormFields from "../inputs/select-fields.tsx";
import SelectFormWithInputFields from "../inputs/selectWithInput-fields.tsx";
import TextAreaField from "../inputs/textArea-fields.tsx";
import NumberFloatField from "../inputs/numberFloat-fields.tsx";
import ImageField from "../inputs/image-field.tsx";

function SubscribeButton({
  label,
  isPending,
}: {
  label: string;
  isPending: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
      children={([canSubmit, isSubmitting, isDirty]) => (
        <Button
          type="primary"
          htmlType="submit"
          disabled={!canSubmit || isPending || isSubmitting || !isDirty}
        >
          {isSubmitting || isPending ? "Procesando..." : label}
        </Button>
      )}
    />
  );
}

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    DateField,
    SelectFormFields,
    SelectFormWithInputFields,
    TextAreaField,
    NumberFloatField,
    ImageField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
