import { Form } from "antd";
import { getFieldError, handleFieldChange } from "./formHelpers";

// Definimos el tipo de status que acepta Antd
type AntdStatus = "" | "error" | "warning" | "success" | "validating" | undefined;

interface FieldWrapperProps {
  field: any;
  label?: string;
  // Usamos el tipo exacto para evitar el error de la imagen
  children: (props: { 
    value: any; 
    onChange: (v: any) => void; 
    onBlur: () => void; 
    status: AntdStatus 
  }) => React.ReactNode;
}


export const FieldWrapper = ({ field, label, children, required }: FieldWrapperProps & { required?: boolean }) => {
  const error = getFieldError(field);
  
  // Robustez: Solo mostrar error si el campo ha sido tocado o se intentó enviar
  // Esto evita que el formulario sea "agresivo" al cargar
  const showError = !!error && (field.state.meta.isTouched || field.state.meta.submitCount > 0);

  return (
    <Form.Item
      label={label}
      required={required} // Soporte para el asterisco rojo de Antd
      validateStatus={showError ? "error" : ""}
      help={showError ? error : null}
    >
      {children({
        value: field.state.value,
        onChange: (v: any) => handleFieldChange(field, v),
        onBlur: field.handleBlur,
        // status se pasa al componente Input de Antd
        status: (showError ? "error" : undefined) as AntdStatus,
      })}
    </Form.Item>
  );
};

