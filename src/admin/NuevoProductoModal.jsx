import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { supabase } from "../libs/supabaseClient";

const NuevoProductoModal = ({ show, onHide, onProductoCreado }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    precio_descuento: "",
    stock: "",
    sku: "",
    imagen_url: "",
    imagenes_extra: "",
    peso: "",
    dimensiones: "",
    destacado: false,
    activo: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio),
        precio_descuento: formData.precio_descuento
          ? parseFloat(formData.precio_descuento)
          : null,
        stock: parseInt(formData.stock),
        peso: formData.peso ? parseFloat(formData.peso) : null,
        imagenes_extra: formData.imagenes_extra
          ? formData.imagenes_extra.split(",").map((img) => img.trim())
          : [],
        dimensiones: formData.dimensiones
          ? JSON.parse(formData.dimensiones)
          : null,
      };

      const { error } = await supabase.from("productos").insert(payload);
      if (error) {
        alert("Error al crear producto: " + error.message);
      } else {
        onProductoCreado?.();
        onHide?.();
      }
    } catch (err) {
      alert("Error al procesar los datos: " + err.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>➕ Nuevo Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              name="descripcion"
              as="textarea"
              rows={2}
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              name="precio"
              type="number"
              value={formData.precio}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Precio con Descuento</Form.Label>
            <Form.Control
              name="precio_descuento"
              type="number"
              value={formData.precio_descuento}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>SKU</Form.Label>
            <Form.Control
              name="sku"
              value={formData.sku}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Imagen principal (URL)</Form.Label>
            <Form.Control
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Imágenes extra (separadas por coma)</Form.Label>
            <Form.Control
              name="imagenes_extra"
              value={formData.imagenes_extra}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Peso (kg)</Form.Label>
            <Form.Control
              name="peso"
              type="number"
              value={formData.peso}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Dimensiones (JSON)</Form.Label>
            <Form.Control
              name="dimensiones"
              as="textarea"
              rows={2}
              placeholder='Ej: {"ancho": 10, "alto": 20, "largo": 30}'
              value={formData.dimensiones}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="¿Es destacado?"
            name="destacado"
            checked={formData.destacado}
            onChange={handleChange}
          />
          <Form.Check
            type="checkbox"
            label="¿Activo?"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar Producto
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NuevoProductoModal;
