import { Button, Image, Input, InputNumber } from "antd";
import type { ChangeEvent } from "react";
import { CiSquarePlus } from "react-icons/ci";

export const SerieItem = ({ index, form }: { index: number; form: any }) => {
  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Guardamos en el formato que pide tu Zod: image: [{ image_byte: "data:..." }]
        form.setFieldValue(`serie[${index}].image`, [
          { image_byte: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="group flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md mb-2 hover:border-mist-400 transition-all shadow-sm">
      <div className="flex-1 flex flex-row gap-1">
        <form.Field name={`serie[${index}].cantidad`}>
          {(field: any) => (
            <InputNumber
              value={field.state.value}
              onChange={(val) => field.handleChange(val)} // 'val' es el número directamente
              placeholder="Cantidad"
              className="w-full rounded-lg"
              status={field.state.meta.errors.length > 0 ? "error" : ""}
            />
          )}
        </form.Field>
        <form.Field name={`serie[${index}].codigo`}>
          {(field: any) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Código de serie"
              className="rounded-lg"
              status={field.state.meta.errors.length > 0 ? "error" : ""}
            />
          )}
        </form.Field>
      </div>

      {/* Lógica de Imagen Integrada */}
      <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-sm border">
        <form.Field name={`serie[${index}].image`}>
          {(field: any) => (
            <div className="flex items-center gap-2">
              <label className="cursor-pointer hover:text-indigo-600 transition-colors p-1">
                <CiSquarePlus size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                />
              </label>

              <div className="w-10 h-10 rounded border overflow-hidden bg-white flex items-center justify-center">
                {field.state.value?.[0]?.image_byte ? (
                  <Image
                    src={field.state.value[0].image_byte}
                    className="w-full h-full object-cover"
                    alt="S"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 text-center leading-none">
                    Sin foto
                  </span>
                )}
              </div>
            </div>
          )}
        </form.Field>
      </div>
      <Button
        danger
        type="text"
        onClick={() => form.removeFieldValue("serie", index)}
        style={{padding:"6px"}}
      >
        x
      </Button>
    </div>
  );
};
