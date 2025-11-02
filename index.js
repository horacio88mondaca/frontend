let socket = null;

const conectarBtn = document.getElementById('conectarBtn');
const desconectarBtn = document.getElementById('desconectarBtn');

conectarBtn.disabled = false;
desconectarBtn.disabled = true;


function conectar() {
  const inputId = document.getElementById("inputIP").value;
  const ipv4 = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
 

  if (ipv4.test(inputId)) {
    socket = io(`http://${inputId}:3000`, { reconnection: false });  
    socket.on('connect', () => {
      conectarBtn.disabled = true;
      desconectarBtn.disabled = false;
      console.log('🟢 Conectado al servidor de monitoreo');
    });

      socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err.message);
      alert(`No se pudo conectar a ${inputId}:3000.\nVerifica que el servidor esté activo.`);
      
      //cerrar socket fallido y restaurar botones
      socket.disconnect();
      socket = null;
      conectarBtn.disabled = false;
      desconectarBtn.disabled = true;
    });



    socket.on('disconnect', () => { 
      conectarBtn.disabled = false;
      desconectarBtn.disabled = true;
      console.log('🔴 Desconectado del servidor'); 
    });



    socket.on('datosSistema', (datos) => {
      // Sistema Operativo
      document.getElementById('sistema').innerHTML = `
        <span>Plataforma:</span> ${datos.sistema.plataforma} <br>
        <span>Distribución:</span> ${datos.sistema.distro} <br>
        <span>Versión:</span> ${datos.sistema.version} <br>
        <span>Arquitectura:</span> ${datos.sistema.arquitectura} <br>
        <span>Hostname:</span> ${datos.sistema.hostname}
      `;

      // Uptime
      document.getElementById('uptime').innerHTML = `
        <span>Tiempo encendido:</span> ${datos.sistema.uptime}
      `;


      // CPU
      document.getElementById('cpu').innerHTML = `
        <span>Fabricante:</span> ${datos.cpu.fabricante} <br>
        <span>Modelo:</span> ${datos.cpu.modelo} <br>
        <span>Núcleos:</span> ${datos.cpu.nucleos} <br>
        <span>Temperatura:</span> ${datos.cpu.temperatura}
      `

      // Memoria
      document.getElementById('memoria').innerHTML = `
      <span>Total:</span> ${datos.memoria.total} <br>
      <span>Libre:</span> ${datos.memoria.libre} <br>
      <span>Usado:</span> ${datos.memoria.usado}
      `;


      // Discos
      let discosHtml = ``;
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
      document.getElementById('red').innerHTML = `${redHtml}`;

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


      // Usuarios conectados
      if (datos.usuarios && datos.usuarios.length > 0) {
        const usuariosHtml = datos.usuarios.map(u => `
          <tr>
          <td>${u.usuario}</td>
          <td>${u.terminal}</td>
          <td>${u.host}</td>
          <td>${u.inicio}</td>
          </tr>
        `).join('');

        document.getElementById('usuarios').innerHTML = `
          <table class="table table-sm table-striped">
            <thead>
              <tr>
              <th>Usuario</th>
              <th>Terminal</th>
              <th>Host</th>
              <th>Inicio</th>
              </tr>
            </thead>
            <tbody>${usuariosHtml}</tbody>
          </table>
        `;
      }
      else {
        document.getElementById('usuarios').innerHTML = '<p>No hay usuarios conectados</p>';
      }

    });



  }
  else {
    alert('Por favor, ingresa una dirección IP válida.');
    return
  }

}

function desconectar() {

  if (socket) {
    socket.disconnect();
    socket = null;
    limpiarDatos();
  }
}


function limpiarDatos() {
  document.getElementById('sistema').innerHTML = '';
  document.getElementById('uptime').innerHTML = '';
  document.getElementById('cpu').innerHTML = '';
  document.getElementById('memoria').innerHTML = '';
  document.getElementById('discos').innerHTML = '';
  document.getElementById('red').innerHTML = '';
  document.getElementById('procesos').innerHTML = '';
  document.getElementById('usuarios').innerHTML = '';
}


conectarBtn.onclick = conectar;
desconectarBtn.onclick = desconectar;