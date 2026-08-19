/**
 * Servicio para envío de reportes de correo usando Resend API.
 * 
 * Si las credenciales no están configuradas, opera en modo SIMULADO,
 * imprimiendo el contenido del correo en la consola del servidor.
 */
export interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
  simulated?: boolean;
}

export async function sendEmail({
  subject,
  html,
}: {
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@miventapp.com';
  const to = process.env.ADMIN_EMAIL;

  // Validar si falta alguna credencial clave para entrar en modo SIMULADO
  if (!apiKey || !to) {
    console.log('\n--- [MOCK GMAIL NOTIFICATION] ---');
    console.log(`Para: ${to || 'No especificado (ADMIN_EMAIL)'}`);
    console.log(`Desde: ${from}`);
    console.log(`Asunto: ${subject}`);
    console.log('Cuerpo del Mensaje (HTML):\n', html);
    console.log('----------------------------------\n');
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }

    return {
      success: true,
      emailId: data.id,
      simulated: false,
    };
  } catch (error: any) {
    console.error('Error al enviar correo mediante Resend:', error.message);
    return {
      success: false,
      error: error.message,
      simulated: false,
    };
  }
}
