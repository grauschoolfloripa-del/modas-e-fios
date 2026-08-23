export const FULFILLMENT_LABELS = {
  aguardando_pagamento: "Aguardando pagamento",
  preparando: "Preparando pedido",
  enviado: "Enviado",
  pronto_retirada: "Pronto para retirada",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const FULFILLMENT_TONE = {
  aguardando_pagamento: "pending",
  preparando: "pending",
  enviado: "approved",
  pronto_retirada: "approved",
  entregue: "approved",
  cancelado: "rejected",
};

export function fulfillmentLabel(status) {
  return FULFILLMENT_LABELS[status] || status;
}
