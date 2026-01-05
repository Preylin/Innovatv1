import { useForm } from "@tanstack/react-form";
import { Button, Form, Input } from "antd";

import { z } from "zod";
import { DynamicArrayField } from "./ListaMultiple";

export const schema = z.object({
  users: z.array(
    z.object({
      first: z.string().min(1, "First name requerido"),
      second: z.string().min(1, "Second name requerido"),
      email: z.email("Email inválido"),
    })
  ),
});

export function UsersForm() {
  const form = useForm({
    defaultValues: {
      users: [{ first: "", second: "", email: "" }],
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="users" mode="array">
        {(arrayField) => (
          <DynamicArrayField
            value={arrayField.state.value}
            addLabel="Add user"
            onAdd={() =>
              arrayField.pushValue({ first: "", second: "", email: "" })
            }
            onRemove={(index) => arrayField.removeValue(index)}
            renderItem={(index) => (
              <div className="flex gap-1">
                <form.Field name={`users[${index}].first`}>
                  {(field) => (
                    <Form.Item
                      validateStatus={
                        field.state.meta.errors.length ? "error" : undefined
                      }
                      help={field.state.meta.errors[0]?.message}
                      style={{ marginBottom: 6 }}
                    >
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="First Name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Form.Item>
                  )}
                </form.Field>
                <form.Field name={`users[${index}].second`}>
                  {(field) => (
                    <Form.Item
                      validateStatus={
                        field.state.meta.errors.length ? "error" : undefined
                      }
                      help={field.state.meta.errors[0]?.message}
                      style={{ marginBottom: 6 }}
                    >
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Second Name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Form.Item>
                  )}
                </form.Field>
                <form.Field name={`users[${index}].email`}>
                  {(field) => (
                    <Form.Item
                      validateStatus={
                        field.state.meta.errors.length ? "error" : undefined
                      }
                      help={field.state.meta.errors[0]?.message}
                      style={{ marginBottom: 6 }}
                    >
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </Form.Item>
                  )}
                </form.Field>
              </div>
            )}
          />
        )}
      </form.Field>

      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </form>
  );
}
