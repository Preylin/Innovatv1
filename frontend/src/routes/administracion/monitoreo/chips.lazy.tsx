import { createLazyFileRoute } from "@tanstack/react-router";
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Popconfirm,
  Row,
  Skeleton,
} from "antd";
import ModalChipsCreate from "../../../modulos/administracion/monitoreo/ModalChipsCreate";
import { useCallback, useMemo, useState } from "react";
import {
  useChipsList,
  useDeleteChip,
} from "../../../api/queries/modulos/administracion/monitoreo/chips.lista";
import ChipImport from "../../../modulos/administracion/monitoreo/ExampleCargaMasiva";
import isoToDDMMYYYY from "../../../helpers/Fechas";
import CarrucelImagenes from "../../../components/molecules/carrucel/Carucel";
import ButtonUpdate from "../../../components/molecules/botons/BottonUpdate";
import ButtonDelete from "../../../components/molecules/botons/BottonDelete";
import ModalChipsUpdate from "../../../modulos/administracion/monitoreo/ModalChipsUpdate";
import { SearchBar } from "../../../components/molecules/input/SearchBar";

export const Route = createLazyFileRoute("/administracion/monitoreo/chips")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Showchips />
    </div>
  );
}

function OptionStatusUI({ status }: { status: number }) {
  switch (status) {
    case 0:
      return <div className="text-yellow-500">Estado: En stock</div>;
    case 1:
      return <div className="text-green-600">Estado: Activo</div>;
    case 2:
      return <div className="text-red-600">Estado: De baja</div>;
    default:
      return "Sin información";
  }
}

function Showchips() {
  const { message } = App.useApp();
  const { mutate } = useDeleteChip();
  // 3. Estados para controlar el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleOpenModal = (id: number) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [openMasiva, setOpenMasiva] = useState(false);
  const handleOpenMasiva = () => {
    setOpenMasiva(true);
  };
  const handleCloseMasiva = () => {
    setOpenMasiva(false);
  };

  const DEFAULT_AVATAR =
    "https://www.movistar.com.pe/documents/37905/9109496/WEBP_ENE_Img-Chip-Desktop.webp";

  const { data, isLoading, isError } = useChipsList();
  const [searchParams, setSearchParams] = useState({
    field: "numero",
    value: "",
  });

  const handleSearch = useCallback(
    (params: { field: string; value: string }) => {
      setSearchParams(params);
    },
    []
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchParams.value) return data;

    const term = searchParams.value.toLowerCase();
    return data.filter((item: any) => {
      const valToSearch = item[searchParams.field];
      return String(valToSearch ?? "")
        .toLowerCase()
        .includes(term);
    });
  }, [data, searchParams]);

  if (isLoading) return <Skeleton active />;
  if (isError) return <p>Error</p>;
  if (!data) return <p>No hay datos</p>;

  return (
    <div className="flex flex-col gap-4 p-2 w-full">
      <Row
        gutter={16}
        style={{ width: "100%" }}
        justify="space-evenly"
        align="middle"
      >
        <Col span={18}>
          <SearchBar
            options={[
              { label: "Número", value: "numero" },
              { label: "ICCID", value: "iccid" },
              { label: "Operador", value: "operador" },
              { label: "Plan MB", value: "mb" },
              { label: "Activación", value: "activacion" },
              { label: "Instalación", value: "instalacion" },
              { label: "Inf. adicional", value: "adicional" },
              { label: "Status", value: "status" },
            ]}
            onSearch={handleSearch}
            defaultField="numero"
          />
        </Col>
        <Col span={6}>
        <Flex justify="end" align="center" wrap gap={8}>
            <Button type="primary" onClick={handleOpen}>
              Crear Chip
            </Button>
            <ModalChipsCreate open={open} onClose={handleClose} />
            <Button type="dashed" onClick={handleOpenMasiva}>
              Masiva
            </Button>
            <ChipImport open={openMasiva} onClose={handleCloseMasiva} />
        </Flex>
        </Col>
      </Row>
      <div className="flex flex-wrap gap-3 p-2 w-full">
        {filteredData.map((chip) => (
          <Card key={chip.id} style={{ flex: "1 1 270px", maxWidth: 300 }}>
            <Row>
              <Col span={24}>
                <CarrucelImagenes
                  autoplay={false}
                  height={160}
                  fallback={DEFAULT_AVATAR}
                  preview={true}
                  images={
                    chip.imagen?.map(
                      (img) => `data:image/png;base64,${img.image_base64}`
                    ) ?? []
                  }
                />
              </Col>
              <Col span={24}>
                <p>Número: {chip.numero}</p>
                <p>ICCID: {chip.iccid}</p>
                <p>Operador: {chip.operador}</p>
                <p>Plan MB: {chip.mb}</p>
                <p>Activación: {isoToDDMMYYYY(chip.activacion)}</p>
                <p>Instalación: {isoToDDMMYYYY(chip.instalacion)}</p>
                <p>
                  Inf. adicional:{" "}
                  {chip.adicional ?? "Sin información adicional"}
                </p>
              </Col>
            </Row>
            <Divider
              style={{ margin: 3, width: "100%", borderColor: "transparent" }}
            />
            <Row gutter={16}>
              <Col span={16}>
                <OptionStatusUI status={chip.status} />
              </Col>
              <Col span={4}>
                <ButtonUpdate onClick={() => handleOpenModal(chip.id)} />
              </Col>
              <Col span={4}>
                <Popconfirm
                  title="¿Eliminar registro?"
                  description="Esta acción no se puede deshacer"
                  okText="Eliminar"
                  cancelText="Cancelar"
                  onConfirm={() =>
                    mutate(chip.id, {
                      onSuccess: () => message.success("Registro eliminado"),
                      onError: (err) => message.error(err.message),
                    })
                  }
                >
                  <ButtonDelete />
                </Popconfirm>
              </Col>
            </Row>
          </Card>
        ))}
        {selectedUserId !== null && (
          <ModalChipsUpdate
            id={selectedUserId}
            open={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
