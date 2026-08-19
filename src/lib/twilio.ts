/**
 * Servicio para envío de notificaciones por WhatsApp usando Twilio API.
 * 
 * Si las credenciales no están configuradas, opera en modo SIMULADO,
 * imprimiendo el mensaje en consola y simulando éxito.
 */
export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export async function sendWhatsApp(body: string): Promise<SendWhatsAppResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.ADMIN_WHATSAPP_NUMBER;

  // Validar si falta alguna credencial clave para entrar en modo SIMULADO
  if (!accountSid || !authToken || !from || !to) {
    console.log('\n--- [MOCK WHATSAPP NOTIFICATION] ---');
    console.log(`Para: ${to || 'No especificado (ADMIN_WHATSAPP_NUMBER)'}`);
    console.log(`Desde: ${from || 'No especificado (TWILIO_WHATSAPP_FROM)'}`);
    console.log('Mensaje:\n', body);
    console.log('-------------------------------------\n');
    return { success: true, simulated: true };
  }

  try {
    // Formatear los números con prefijo de WhatsApp si no lo tienen
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: formattedFrom,
          Body: body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }

    return {
      success: true,
      messageId: data.sid,
      simulated: false,
    };
  } catch (error: any) {
    console.error('Error al enviar WhatsApp mediante Twilio:', error.message);
    return {
      success: false,
      error: error.message,
      simulated: false,
    };
  }
}
