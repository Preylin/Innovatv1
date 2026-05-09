import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext, useFormContext } from "./form-context.tsx";
import TextField from "../text-fields.tsx";
import NumberField from "../number-fields.tsx";
import DateField from "../date-fields.tsx";
import { Button } from "antd";

function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <Button type="primary" htmlType="submit" disabled={!canSubmit}>
          {isSubmitting ? "..." : label}
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
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
