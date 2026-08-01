export class ModelProvider {
  constructor(id) {
    if (new.target === ModelProvider) throw new Error('ModelProvider é abstrato.');
    this.id = id;
  }

  async listModels() {
    throw new Error('listModels não implementado.');
  }

  async testConnection() {
    throw new Error('testConnection não implementado.');
  }

  async chat(_request) {
    throw new Error('chat não implementado.');
  }
}

export function validateChatRequest(request) {
  if (!request || typeof request !== 'object') throw new Error('Requisição de chat inválida.');
  if (!Array.isArray(request.messages) || request.messages.length === 0) throw new Error('messages deve conter ao menos uma mensagem.');
  for (const message of request.messages) {
    if (!['system', 'user', 'assistant', 'tool'].includes(message?.role) || typeof message.content !== 'string') {
      throw new Error('Mensagem inválida: role e content são obrigatórios.');
    }
  }
}
