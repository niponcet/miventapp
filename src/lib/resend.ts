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
  to: recipientTo,
  subject,
  html,
}: {
  to?: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  let from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const to = recipientTo || process.env.ADMIN_EMAIL || 'javo161669@gmail.com';

  // Si se usa Resend con una cuenta de prueba gratuita sin dominio propio,
  // el remitente debe ser onboarding@resend.dev
  if (apiKey && from.includes('@gmail.com')) {
    from = 'MiVentApp <onboarding@resend.dev>';
  }

  // Si no hay API Key configurada, opera en modo SIMULACIÓN con registro completo
  if (!apiKey) {
    console.log('\n================ [CORREO SIMULADO] ================');
    console.log(`Para: ${to}`);
    console.log(`Desde: ${from}`);
    console.log(`Asunto: ${subject}`);
    console.log('----------------------------------------------------');
    console.log('Estado: Simulado exitosamente (agrega RESEND_API_KEY para envío real)');
    console.log('====================================================\n');
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
        to: [to],
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
