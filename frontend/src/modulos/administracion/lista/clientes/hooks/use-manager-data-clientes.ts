


import { useMemo } from "react";
import { ClientesManager, ProveedoresManager, UbicacionesManager, type ClientesManagerData, type ProveedoresManagerData, type UbicacionesManagerData } from "../model/ManagerData";
import type { ClienteOutShortApiType, ProveedorOutApiType, UbicacionOutApiType } from "../model/api/clientes-schema-api";

export function useManagerDataClientes(apiData: ClienteOutShortApiType[] | undefined) {

    // 1. Normalizamos los datos de la API
    const dataNormalizada = useMemo<ClientesManagerData[]>(() => {
        if (!apiData) return [];

        return apiData.map((item, index) => ({
            key: index + 1,
            id: item.id,
            nro_documento: item.nro_documento || "",
            razon_social: item.razon_social || "",
        }));
    }, [apiData]);

    // 2. Instanciamos la clase controladora
    const manager = useMemo(() => new ClientesManager(dataNormalizada), [dataNormalizada]);

    return {
        ClientesList: manager.getData(), // Retorna directamente el Array listo para el .map()
        manager,                        // Retorna la clase por si quieres llamar a manager.updateData() en un botón
    };
}

export function useManagerDataUbicaciones(apiData: UbicacionOutApiType[] | undefined) {

    // 1. Normalizamos los datos de la API
    const dataNormalizada = useMemo<UbicacionesManagerData[]>(() => {
        if (!apiData) return [];

        return apiData.map((item, index) => ({
            key: index + 1,
            id: item.id,
            ubicacion: item.ubicacion || "",
        }));
    }, [apiData]);

    // 2. Instanciamos la clase controladora
    const manager = useMemo(() => new UbicacionesManager(dataNormalizada), [dataNormalizada]);

    return {
        UbicacionesList: manager.getData(), // Retorna directamente el Array listo para el .map()
        manager,                        // Retorna la clase por si quieres llamar a manager.updateData() en un botón
    };
}

export function useManagerDataProveedores(apiData: ProveedorOutApiType[] | undefined) {

    // 1. Normalizamos los datos de la API
    const dataNormalizada = useMemo<ProveedoresManagerData[]>(() => {
        if (!apiData) return [];

        return apiData.map((item, index) => ({
            key: index + 1,
            id: item.id,
            nro_documento: item.nro_documento || "",
            razon_social: item.razon_social || "",
        }));
    }, [apiData]);

    // 2. Instanciamos la clase controladora
    const manager = useMemo(() => new ProveedoresManager(dataNormalizada), [dataNormalizada]);

    return {
        ProveedoresList: manager.getData(), // Retorna directamente el Array listo para el .map()
        manager,                        // Retorna la clase por si quieres llamar a manager.updateData() en un botón
    };
}