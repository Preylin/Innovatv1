import { Statistic, Card, Skeleton, Alert } from "antd";
import { useCatalogoStockDetalladoMercaderiaList } from "../../../../../api/queries/modulos/almacen/ingresos/mercaderia.api";
import { useMemo } from "react";
import type { StockActualDetalladoType } from "../../../../../api/queries/modulos/almacen/ingresos/mercaderia.api.schema";
import { useCatalogoStockDetalladoMaterialList } from "../../../../../api/queries/modulos/almacen/ingresos/material.api";
import type { StockActualDetalladoMaterialType } from "../../../../../api/queries/modulos/almacen/ingresos/material.api.schema";

interface CalculoTotales {
  id: number;
  stock_actual: number;
  valor: number;
  total: number;
  moneda: string;
}

function TotalesMercaderia() {
  const { data, isLoading, isError } =
    useCatalogoStockDetalladoMercaderiaList();

  const dataCalculate = useMemo(() => {
    if (!data) return [];
    return data.map(
      (item: StockActualDetalladoType, index: number): CalculoTotales => ({
        id: index,
        stock_actual: item.stock_actual ?? 0,
        valor: item.valor ?? 0,
        total: (item.stock_actual ?? 0) * (item.valor ?? 0),
        moneda: item.moneda ?? "",
      }),
    );
  }, [data]);

  //Calcular el total en soles
  const solesMercaderia = dataCalculate.reduce((acc, item) => {
    if (item.moneda === "S/") {
      return acc + item.total;
    }
    return acc;
  }, 0);

  //Calcular el total en dólares
  const dolaresMercaderia = dataCalculate.reduce((acc, item) => {
    if (item.moneda === "$") {
      return acc + item.total;
    }
    return acc;
  }, 0);

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return (
      <Alert type="error" message="Error al cargar datos de stock" showIcon />
    );

  return (
    <div className="grid grid-cols-1 gap-2">
      <h1 className="flex items-center justify-center font-bold text-xs md:text-lg">MERCADERÍA</h1>
      <div className="grid grid-cols-1 gap-3">
        <Card
        hoverable
        >
          <Statistic
            title={<div className="font-bold">Soles</div>}
            value={solesMercaderia}
            precision={2}
            styles={{ content: { color: "#3f8600", fontSize: "1.2rem" } }}
            prefix={"S/."}
          />
        </Card>

        <Card
        hoverable
        >
          <Statistic
            title={<div className="font-bold">Dólares</div>}
            value={dolaresMercaderia}
            precision={2}
            styles={{ content: { color: "#cf1322", fontSize: "1.2rem"} }}
            prefix={"$"}
          />
        </Card>
      </div>
    </div>
  );
}

function TotalesMaterial() {
  const { data, isLoading, isError } =
    useCatalogoStockDetalladoMaterialList();

  const dataCalculate = useMemo(() => {
    if (!data) return [];
    return data.map(
      (item: StockActualDetalladoMaterialType, index: number): CalculoTotales => ({
        id: index,
        stock_actual: item.stock_actual ?? 0,
        valor: item.valor ?? 0,
        total: (item.stock_actual ?? 0) * (item.valor ?? 0),
        moneda: item.moneda ?? "",
      }),
    );
  }, [data]);

  //Calcular el total en soles
  const solesMaterial = dataCalculate.reduce((acc, item) => {
    if (item.moneda === "S/") {
      return acc + item.total;
    }
    return acc;
  }, 0);

  //Calcular el total en dólares
  const dolaresMaterial = dataCalculate.reduce((acc, item) => {
    if (item.moneda === "$") {
      return acc + item.total;
    }
    return acc;
  }, 0);

  if (isLoading) return <Skeleton active className="p-6" />;
  if (isError)
    return (
      <Alert type="error" message="Error al cargar datos de stock" showIcon />
    );

  return (
    <div className="grid grid-cols-1 gap-2">
      <h1 className="flex items-center justify-center font-bold text-xs md:text-lg">MATERIALES</h1>
      <div className="grid grid-cols-1 gap-3">
        <Card
        hoverable
        >
          <Statistic
            title={<div className="font-bold">Soles</div>}
            value={solesMaterial}
            precision={2}
            styles={{ content: { color: "#3f8600", fontSize: "1.2rem" } }}
            prefix={"S/."}
          />
        </Card>

        <Card
        hoverable
        >
          <Statistic
            title={<div className="font-bold">Dólares</div>}
            value={dolaresMaterial}
            precision={2}
            styles={{ content: { color: "#cf1322", fontSize: "1.2rem"} }}
            prefix={"$"}
          />
        </Card>
      </div>
    </div>
  );
}

export function PanelTotalesSolesDolares() {
  return (
    <div className="grid grid-cols-1 gap-4 p-2 md:col-span-1 md:col-start-1">
      {/* Sección Mercadería */}
      <TotalesMercaderia />

      {/* Sección Materiales */}
      <TotalesMaterial />
    </div>
  );
}
