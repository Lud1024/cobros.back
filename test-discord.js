// Test de Discord Webhook
const WEBHOOK = 'https://discord.com/api/webhooks/1458942632892956695/rNGbAE19L29QzHnE6kdZhMGSwvfnHPjZDypHJ5PYtIWcFFUuff_f27HRNElNVTF_Qccu';

async function testDiscord() {
  console.log('Enviando mensaje de prueba a Discord...');
  
  try {
    const response = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '🧪 **Test de conexión exitoso!**\nCobros API está conectado correctamente.',
        embeds: [{
          title: '🔴 [ERROR] Test de Error',
          description: 'Este es un mensaje de prueba para verificar que los logs llegan correctamente.',
          color: 0xFF0000,
          timestamp: new Date().toISOString(),
          fields: [
            { name: 'Servidor', value: 'Local', inline: true },
            { name: 'Fecha', value: new Date().toLocaleString(), inline: true }
          ]
        }]
      })
    });
    
    console.log('Response status:', response.status);
    if (response.ok) {
      console.log('✅ Mensaje enviado exitosamente!');
    } else {
      const text = await response.text();
      console.log('❌ Error:', text);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testDiscord();
