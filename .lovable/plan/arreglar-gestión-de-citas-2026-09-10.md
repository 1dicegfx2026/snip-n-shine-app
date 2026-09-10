# Arreglar gestión de citas

## Objetivo
Hacer que cada cita tenga controles claros y funcionales para verla, editarla y cancelarla.

## Cambios
- Convertir toda la tarjeta de la cita en una vista clara con botones visibles: **Ver detalles**, **Editar cita** y **Cancelar cita**.
- Mostrar los detalles completos de la reserva y del método de pago.
- Pedir confirmación antes de cancelar para evitar errores.
- Esperar la respuesta del sistema al editar o cancelar; mostrar éxito solo si el cambio realmente se guardó y mostrar un error claro si falla.
- Mantener las citas canceladas visibles con la opción de reservar de nuevo.

## Verificación
- Probar con una cuenta real que abrir, editar y cancelar respondan correctamente.
- Confirmar que el cambio quede guardado al recargar la página.
- Revisar la vista en teléfono y computadora.
