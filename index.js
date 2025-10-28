const socket = io('http://192.168.1.4:3000');

socket.on('connect', () => {
  console.log('🟢 Conectado al servidor de monitoreo');
});

socket.on('disconnect', () => { 
  console.log('🔴 Desconectado del servidor'); 
});

socket.on('datosSistema', (datos) => {
  // Sistema Operativo
document.getElementById('sistema').innerHTML = `
  <h3>Sistema</h3>
  <span>Plataforma:</span> ${datos.sistema.plataforma} <br>
  <span>Distribución:</span> ${datos.sistema.distro} <br>
  <span>Versión:</span> ${datos.sistema.version} <br>
  <span>Arquitectura:</span> ${datos.sistema.arquitectura} <br>
  <span>Hostname:</span> ${datos.sistema.hostname}
`;


  // CPU
    const usoCPU = parseFloat(datos.cpu.temperatura || datos.cpu.porcentaje || 0);
  document.getElementById('cpu').innerHTML = `
  <h3>CPU</h3>
  <span>Fabricante:</span> ${datos.cpu.fabricante} <br>
  <span>Modelo:</span> ${datos.cpu.modelo} <br>
  <span>Núcleos:</span> ${datos.cpu.nucleos} <br>
  <span>Temperatura:</span> ${datos.cpu.temperatura}
    <p><strong>Uso:</strong> ${usoCPU}%</p>
    <div class="progress mb-2">
      <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
           style="width:${usoCPU}%; transition: width 0.5s ease;"></div>
    </div>
  `

   // Memoria
document.getElementById('memoria').innerHTML = `
 <h3>Memoria</h3>
 <span>Total:</span> ${datos.memoria.total} <br>
 <span>Libre:</span> ${datos.memoria.libre} <br>
 <span>Usado:</span> ${datos.memoria.usado}
`;


 // Discos
    let discosHtml = `<h3>Discos</h3>`;
    if (datos.particiones.sda1) {
        discosHtml += `
            <strong>Raíz:</strong><br>
            <span>FS:</span> ${datos.particiones.sda1.filesystem}<br>
            <span>Tamaño:</span> ${datos.particiones.sda1.tamaño}<br>
            <span>Usado:</span> ${datos.particiones.sda1.usado}<br>
            <span>Libre:</span> ${datos.particiones.sda1.libre}<br>
            <span>Uso:</span> ${datos.particiones.sda1.usoPorcentaje}<br><br>
        `;
    }
    if (datos.particiones.sda5) {
        discosHtml += `
            <strong>Swap:</strong><br>
            <span>Tamaño:</span> ${datos.particiones.sda5.tamaño}<br>
            <span>Usado:</span> ${datos.particiones.sda5.usado}<br>
            <span>Libre:</span> ${datos.particiones.sda5.libre}<br>
            <span>Uso:</span> ${datos.particiones.sda5.usoPorcentaje}
        `;
    }
    document.getElementById('discos').innerHTML = discosHtml;

  // Red
    const redHtml = datos.red.map(iface => `
        <div style="margin-bottom: 10px;">
            <span>Interfaz:</span> ${iface.interfaz} <br>
            <span>IP:</span> ${iface.ip4} <br>
            <span>MAC:</span> ${iface.mac} <br>
            <span>Recibido:</span> ${iface.recibidoMB} MB <br>
            <span>Enviado:</span> ${iface.enviadoMB} MB
        </div>
    `).join('');
    document.getElementById('red').innerHTML = `<h3>Red</h3>${redHtml}`;

    // Procesos
const procesosHtml = datos.procesos.map(p => `
  <tr>
    <td>${p.nombre}</td>
    <td>${p.pid}</td>
    <td>${p.cpu}</td>
    <td>${p.memoria}</td>
  </tr>
`).join('');

document.getElementById('procesos').innerHTML = `
  <h3>Top 5 Procesos</h3>
  <table class="table table-sm table-striped">
    <thead>
      <tr>
        <th>Nombre</th>
        <th>PID</th>
        <th>CPU</th>
        <th>Memoria</th>
      </tr>
    </thead>
    <tbody>${procesosHtml}</tbody>
  </table>
`;




});


