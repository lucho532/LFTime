package com.lftime.servidor.arquitectura.infractores.controladores;

import com.lftime.servidor.arquitectura.infractores.repositorios.RepositorioInfractor;

/** Controlador de ejemplo que salta la capa de servicios a propósito. No usar en código real. */
public class ControladorInfractor {

    private final RepositorioInfractor repositorio = new RepositorioInfractor();

    public String consultar() {
        return repositorio.leer();
    }
}
