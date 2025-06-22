const app = require('./src/app');
const PORT = process.env.PORT || 3000;

// Escuchar en todas las interfaces de red (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`🌐 Accesible desde la red local en http://[TU_IP]:${PORT}`);
});