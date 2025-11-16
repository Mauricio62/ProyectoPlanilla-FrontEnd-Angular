import { environment } from "../../../environments/environment";

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      roles: '/auth/roles'
    },
    cargo: {
      list: '/cargos/listar',
      getById: '/cargos/obtenerById',
      create: '/cargos/insertar',
      update: '/cargos/actualizar',
      changeStatus: '/cargos/cambiarEstado',
      delete: '/cargos/eliminar'
    },
    asistencia: {
      list: '/asistencias',
      buscar: '/asistencias/buscar',
      descargarExcel: '/asistencias/descargar-excel',
      cargarExcel: '/asistencias/cargar-excel',
      guardar:'/asistencias/guardar'
    },
    situacionTrabajador: {
      list: '/situaciones-trabajador/listar',
      getById: '/situaciones-trabajador/obtenerById',
      create: '/situaciones-trabajador/insertar',
      update: '/situaciones-trabajador/actualizar',
      changeStatus: '/situaciones-trabajador/cambiarEstado'
    },
    genero: {
      list: '/generos/listar',
      getById: '/generos/obtenerById',
      create: '/generos/insertar',
      update: '/generos/actualizar',
      changeStatus: '/generos/cambiarEstado'
    },
    sistemaPension: {
      list: '/sistemas-pension/listar',
      getById: '/sistemas-pension/obtenerById',
      create: '/sistemas-pension/insertar',
      update: '/sistemas-pension/actualizar',
      changeStatus: '/sistemas-pension/cambiarEstado'
    },
    tipoDocumento: {
      list: '/tipos-documento/listar',
      getById: '/tipos-documento/obtenerById',
      create: '/tipos-documento/insertar',
      update: '/tipos-documento/actualizar',
      changeStatus: '/tipos-documento/cambiarEstado'
    },
    estadoCivil: {
      list: '/estados-civiles/listar',
      getById: '/estados-civiles/obtenerById',
      create: '/estados-civiles/insertar',
      update: '/estados-civiles/actualizar',
      changeStatus: '/estados-civiles/cambiarEstado'
    },
    trabajador: {
      list: '/trabajador/listar',
      getById: '/trabajador/obtenerById',
      create: '/trabajador/insertar',
      update: '/trabajador/actualizar',
      changeStatus: '/trabajador/cambiar-estado',
      delete: '/trabajador/eliminar'
    },
    planillaMensual: {
      listar: '/planilla-mensual/listarPlanilla',
      buscarBoleta: '/planilla-mensual/buscarBoleta',
      calcularPlanilla: '/planilla-mensual/calcularPlanilla',
      guardarPlanilla: '/planilla-mensual/guardarPlanilla'
    }

  },
  timeout: 30000
};