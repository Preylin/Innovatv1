import { useForm } from "@tanstack/react-form";
import type { CuentasPorPagarRegistroPagoCreateSchemaApiType } from "../../data/api.shemaCuentasPorCobar";
import { Modal } from "antd";
import z from "zod";
import FieldInfo from "../formulario/components/core/errors";
import { FaCheck } from "react-icons/fa";


const CuentasPorPagarRegistroPagoCreateUISchema = z.object({
  obligacion_id: z.number(),
  monto_pagado: z.number(),
  mes_correspondiente: z.string(),
  comprobante: z.string().min(1, "Requerido"),
  estado_pago: z.enum(["TOTAL", "PARCIAL", "ADELANTADO"]),
  metodo_pago: z.string(),
  observaciones: z.string(),
});

interface Props {
  obligacion: any;
  mesActual: string;
  onClose: () => void;
  onSuccess: (data: CuentasPorPagarRegistroPagoCreateSchemaApiType) => void;
  isPending: boolean;
}

export function ModalRegistrarPago({
  obligacion,
  mesActual,
  onClose,
  onSuccess,
  isPending,
}: Props) {
  const form = useForm({
    defaultValues: {
      obligacion_id: obligacion.id as number,
      monto_pagado: obligacion.monto_sugerido as number,
      mes_correspondiente: mesActual as string,
      comprobante: "",
      estado_pago: "TOTAL" as "TOTAL" | "PARCIAL" | "ADELANTADO",
      metodo_pago: "TRANSFERENCIA",
      observaciones: "",
    },
    validators: {
      onSubmit: CuentasPorPagarRegistroPagoCreateUISchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const payload: CuentasPorPagarRegistroPagoCreateSchemaApiType = {
          ...value,
          comprobante: value.comprobante || null,
          metodo_pago: value.metodo_pago || null,
          observaciones: value.observaciones || null,
        };

        await onSuccess(payload);
        formApi.reset();
        onClose();
      } catch (err) {
        console.error(err);
      }
    },
  });

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      width={{ xs: "90%", sm: "80%", lg: "50%" }}
    >
      <div className="mb-2">
        <h3 className="text-xl font-black text-slate-800 tracking-tight dark:text-mist-100 ">
          Confirmar Transacción
        </h3>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter shadow shadow-slate-200 rounded-md p-2  bg-mist-50">
          Empresa:{" "}
          <span className="font-semibold text-emerald-400">
            {obligacion.empresa}
          </span>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="p-4 space-y-5 shadow shadow-slate-200 rounded-md bg-mist-50"
      >
        {/* Monto principal */}
        <form.Field
          name="monto_pagado"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ">
                Monto a Liquidar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {obligacion.moneda}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={field.state.value.toFixed(2)}
                  onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-md p-2 pl-14 font-mono font-black text-xl text-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <FieldInfo field={field} />
            </div>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Estado del Pago (NUEVO INTEGRADO) */}
          <form.Field
            name="estado_pago"
            children={(field) => (
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ">
                  Tipo de Registro
                </label>
                <div className="flex gap-2 p-2 rounded-md shadow shadow-slate-400">
                  {["TOTAL", "PARCIAL", "ADELANTADO"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.handleChange(type as any)}
                      className={`flex-1 py-2 text-[10px] font-black bg-mist-200 rounded-md transition-all ${
                        field.state.value === type
                          ? " text-indigo-600 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* N° Operación */}
          <form.Field
            name="comprobante"
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ">
                  N° Comprobante
                </label>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="F001-0001"
                  className="border border-slate-200 rounded-md p-3 text-black focus:ring-4 focus:ring-indigo-500/10 outline-none focus:border-indigo-500 transition-all text-sm"
                />
                <FieldInfo field={field} />
              </div>
            )}
          />

          {/* Medio de Pago */}
          <form.Field
            name="metodo_pago"
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ">
                  Medio de Pago
                </label>
                <select
                  value={field.state.value || ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border border-slate-200 rounded-md p-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 "
                >
                  <option value="BCP SOLES">Bcp Soles</option>
                  <option value="BCP DOLARES">Bcp Dólares</option>
                  <option value="CAJA CHICA">Caja Chica</option>
                  <option value="YAPE/PLIN">Yape / Plin</option>
                </select>
                <FieldInfo field={field} />
              </div>
            )}
          />
        </div>

        {/* Observaciones */}
        <form.Field
          name="observaciones"
          children={(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ">
                Notas del Pago
              </label>
              <textarea
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Detalles adicionales..."
                rows={2}
                className="border border-slate-200 rounded-md p-3 text-black focus:ring-4 focus:ring-indigo-500/10 outline-none focus:border-indigo-500 transition-all  resize-none text-sm"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <div className="flex gap-3 pt-4 ">
          <button
            type="submit"
            disabled={isPending}
            className="flex-2 bg-slate-900 text-white p-2 text-xs rounded-xl font-black shadow-md shadow-slate-200 hover:bg-indigo-600 disabled:bg-slate-300 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                REGISTRANDO...
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <FaCheck  className="animate-bounce" />{" "}
                <p>CONFIRMAR PAGO</p>
              </div>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
